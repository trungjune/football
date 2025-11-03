#!/bin/bash

echo "🔧 Fixing all Prisma enum imports..."

# Replace enum imports with comments
find backend/src -name "*.ts" -exec sed -i 's/import { Position } from '\''@prisma\/client'\'';/\/\/ Position enum replaced with string literal/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/import { AttendanceStatus } from '\''@prisma\/client'\'';/\/\/ AttendanceStatus enum replaced with string literal/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/import { FeeType, PaymentMethod, PaymentStatus } from '\''@prisma\/client'\'';/\/\/ Finance enums replaced with string literals/g' {} \;

# Replace enum usages with string literals
find backend/src -name "*.ts" -exec sed -i 's/Position\.GOALKEEPER/'\''GOALKEEPER'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/Position\.DEFENDER/'\''DEFENDER'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/Position\.MIDFIELDER/'\''MIDFIELDER'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/Position\.FORWARD/'\''FORWARD'\''/g' {} \;

find backend/src -name "*.ts" -exec sed -i 's/AttendanceStatus\.PRESENT/'\''PRESENT'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/AttendanceStatus\.ABSENT/'\''ABSENT'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/AttendanceStatus\.LATE/'\''LATE'\''/g' {} \;

find backend/src -name "*.ts" -exec sed -i 's/FeeType\.MONTHLY/'\''MONTHLY'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/FeeType\.SPECIAL/'\''SPECIAL'\''/g' {} \;

find backend/src -name "*.ts" -exec sed -i 's/PaymentMethod\.CASH/'\''CASH'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/PaymentMethod\.BANK_TRANSFER/'\''BANK_TRANSFER'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/PaymentMethod\.CARD/'\''CARD'\''/g' {} \;

find backend/src -name "*.ts" -exec sed -i 's/PaymentStatus\.PENDING/'\''PENDING'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/PaymentStatus\.COMPLETED/'\''COMPLETED'\''/g' {} \;
find backend/src -name "*.ts" -exec sed -i 's/PaymentStatus\.FAILED/'\''FAILED'\''/g' {} \;

echo "✅ All Prisma enums fixed!"