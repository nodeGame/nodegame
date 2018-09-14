# In progress. Do not use now.

# Rename files.
rename "s/v2/v3/g"  *

# Rename text in files.
find . -type f -exec sed -i 's/2.x/3.x/g' {} +
find . -type f -exec sed -i 's/v2/v3/g' {} +

