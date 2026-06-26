"""initial empty baseline

Establishes the migration chain. No domain tables yet — the walking skeleton
(issue #2) only needs the migration tooling proven to run cleanly from empty.
Domain tables (proposals, audit_log, jobs, traces) arrive in later slices.

Revision ID: 0001_initial
Revises:
Create Date: 2026-06-26
"""
from typing import Sequence, Union

from alembic import op  # noqa: F401
import sqlalchemy as sa  # noqa: F401

revision: str = "0001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
