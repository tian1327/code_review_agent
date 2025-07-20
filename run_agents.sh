## PR directory
input='data/code_review_data/pydata__xarray-6992_problem_statement.txt'
repo_root='PR_repos'
repo_path='PR_repos/xarray'
module_path='xarray'
hop=1

# execute the python code
python -W ignore main.py  --input "$input" \
        --repo_root "$repo_root" \
        --repo_path "$repo_path" \
        --module_path "$module_path" \
        --hop "$hop" \
        --verbose --prefix hard \
        --skip_routing \``
        --skip_architect \
        --skip_review \
        # --update_deps_graph --update_kd_graph
