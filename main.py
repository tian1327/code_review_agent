import argparse
from utils.logger import set_logger
from query_routing_agent import query_routing_single, load_routing_examples, \
    parse_response, parse_routing_decision
from query_architect_agent import query_architect_agent_single
from query_code_review_agent import query_code_review_single
from query_test_generation_agent import query_test_generation_single
import genai_sample_util



def load_pr_data(file_path):
    pr_data = {}

    # read the entire file into the problem statement
    with open(file_path, 'r') as f:
        pr_data['problem_statement'] = f.read().strip()

    patch_file = file_path.replace('problem_statement', 'patch')
    with open(patch_file, 'r') as f:
        pr_data['patch'] = f.read().strip()

    test_patch_file = file_path.replace('problem_statement', 'test_patch')
    with open(test_patch_file, 'r') as f:
        pr_data['test_patch'] = f.read().strip()

    return pr_data


def main_worker(args, logger, pr_data, access_token):

    problem_statement = pr_data['problem_statement']
    patch = pr_data['patch']
    test_patch = pr_data['test_patch']

    args.logger = logger
    send_back = False

    #---------- query the PR routing agent
    routing_model = 'gpt-4o'
    logger.info(f".......... Running PR Routing Agent ..........")
    if args.skip_routing:
        logger.info("Skipping Routing Agent.")
        pass
    else:
        args.strategy = '2' # 1-shot in-context learning for Routing Agent

        easy_examples, hard_examples = load_routing_examples()
        query, response = query_routing_single(args, access_token,
                                            routing_model,
                                            patch,
                                            problem_statement,
                                            easy_examples,
                                            hard_examples
                                            )
        # parse routing response for different model
        response = parse_response(routing_model, response)

        if args.verbose:
            logger.info(f"Query:\n{query}")
            logger.info(f"Response:\n{response}")

        is_easy, reason = parse_routing_decision(response)
        if not is_easy:
            send_back = True
            logger.info(f"This PR requires human review. Reasons: {reason}")
            return send_back
        else:
            logger.info(f"This PR is easy to review.")
            logger.info(f"Reasons: {reason}")


    #---------- query the PR architect agent
    architect_model = 'gpt-4o'
    logger.info(f".......... Running PR Architect Agent ..........")
    architect_info, kd_graph, file_function_map = query_architect_agent_single(args, access_token,
                                                architect_model,
                                                patch,
                                                problem_statement)

    #---------- query the PR code review agent
    code_review_model = 'gpt-4o'
    logger.info(f".......... Running PR Code Review Agent ..........")
    if not args.skip_review:
        overall_good, reasons = query_code_review_single(args, access_token,
                                        code_review_model,
                                        patch,
                                        problem_statement,
                                        architect_info
                                        )
        if overall_good:
            logger.info(f"Congratulations! Your PR passed code review.")
        else:
            # return to human for review
            send_back = True
            logger.warning(f"PR requires human review. Reasons: {reasons}")
            return send_back
    else:
        logger.info("Skipping Code Review Agent.")

    #---------- query the Test Generation agent
    test_gen_model = 'gpt-4o'
    logger.info(f".......... Running PR Test Generation Agent ..........")
    new_test_case_list = query_test_generation_single(args, access_token,
                                       test_gen_model,
                                       test_patch,
                                       patch,
                                       problem_statement,
                                       architect_info,
                                       kd_graph,
                                       file_function_map
                                       )

    return send_back


if __name__ == "__main__":

    # define the argument parser
    parser = argparse.ArgumentParser(description="Process some data.")
    parser.add_argument("--input", type=str, help="Input PR file path")
    parser.add_argument("--repo_root", type=str, help="Root directory to the PR repository")
    parser.add_argument("--repo_path", type=str, help="Path to the PR repository")
    parser.add_argument("--module_path", type=str, help="Path to the Python module for pydeps consideration")
    # parser.add_argument("--output", type=str, help="Output file path")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose output")
    parser.add_argument("--skip_routing", action="store_true", help="Skip routing agent, for evaluating hard PRs")
    parser.add_argument("--skip_architect", action="store_true", help="Skip architect agent, for fast code evaluation")
    parser.add_argument("--skip_review", action="store_true", help="Skip code review agent, for fast code evaluation")
    parser.add_argument("--update_deps_graph", action="store_true", help="Update the dependencies graph")
    parser.add_argument("--update_kd_graph", action="store_true", help="Update the knowledge graph")
    parser.add_argument("--hop", type=int, default=1, help="How many hops away to search for relevant files")
    parser.add_argument("--prefix", type=str, help="Prefix for log files")
    parser.add_argument("--log_mode", type=str, default="both", help="Logging mode: file, console, or both")

    args = parser.parse_args()

    # set the logger
    logger = set_logger(args)

    # load the PR
    pr_data = load_pr_data(args.input)
    logger.info(f"Loaded PR data: {args.input}")

    # get the token ready for GenAI
    access_token  = genai_sample_util.get_genai_token()

    send_back = main_worker(args, logger, pr_data, access_token)
    logger.info(f"PR Review Completed!")