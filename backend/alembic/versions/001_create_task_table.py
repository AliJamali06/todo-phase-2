"""Create task table

Revision ID: 001
Revises:
Create Date: 2026-01-24

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create task table
    op.create_table(
        'task',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('user_id', sa.Uuid(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for performance
    op.create_index('idx_task_id', 'task', ['id'])
    op.create_index('idx_task_user_id', 'task', ['user_id'])
    op.create_index('idx_task_user_completed', 'task', ['user_id', 'completed'])

    # Add constraint for non-empty title
    op.create_check_constraint(
        'chk_title_not_empty',
        'task',
        sa.column('title') != ''
    )


def downgrade() -> None:
    op.drop_constraint('chk_title_not_empty', 'task', type_='check')
    op.drop_index('idx_task_user_completed', 'task')
    op.drop_index('idx_task_user_id', 'task')
    op.drop_index('idx_task_id', 'task')
    op.drop_table('task')
