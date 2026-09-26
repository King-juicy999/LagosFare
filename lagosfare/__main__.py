"""Allow the package to be run directly with python -m lagosfare."""

import sys

from .cli import main

if __name__ == "__main__":
    sys.exit(main())
