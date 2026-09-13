-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MECANICO', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ATIVO', 'INATIVO');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CARRO', 'MOTO');

-- CreateEnum
CREATE TYPE "BudgetStatus" AS ENUM ('RASCUNHO', 'ENVIADO', 'APROVADO', 'RECUSADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SERVICO', 'PECA');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('AGUARDANDO', 'EM_EXECUCAO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "workshops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workshops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "status" "UserStatus" NOT NULL DEFAULT 'ATIVO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'CARRO',
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "plate" TEXT,
    "mileage" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "chassis" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" TEXT NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_histories" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mileage" INTEGER NOT NULL,
    "problemReported" TEXT NOT NULL,
    "diagnosis" TEXT NOT NULL,
    "servicesDone" TEXT NOT NULL,
    "partsUsed" TEXT,
    "notes" TEXT,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "responsibleName" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "service_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "code" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationDate" TIMESTAMP(3) NOT NULL,
    "status" "BudgetStatus" NOT NULL DEFAULT 'RASCUNHO',
    "notes" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT,
    "workOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "code" SERIAL NOT NULL,
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'AGUARDANDO',
    "problemReported" TEXT NOT NULL,
    "diagnosis" TEXT,
    "servicesDone" TEXT,
    "partsUsed" TEXT,
    "notes" TEXT,
    "mileageIn" INTEGER NOT NULL,
    "mileageOut" INTEGER,
    "estimatedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "responsibleName" TEXT,
    "clientId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "userId" TEXT,
    "serviceHistoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workshopId" TEXT NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_items" (
    "id" TEXT NOT NULL,
    "type" "ItemType" NOT NULL DEFAULT 'SERVICO',
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "budgetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_workshopId_idx" ON "users"("workshopId");

-- CreateIndex
CREATE INDEX "clients_workshopId_idx" ON "clients"("workshopId");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "clients_cpf_idx" ON "clients"("cpf");

-- CreateIndex
CREATE INDEX "clients_phone_idx" ON "clients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "clients_workshopId_cpf_key" ON "clients"("workshopId", "cpf");

-- CreateIndex
CREATE INDEX "vehicles_workshopId_idx" ON "vehicles"("workshopId");

-- CreateIndex
CREATE INDEX "vehicles_plate_idx" ON "vehicles"("plate");

-- CreateIndex
CREATE INDEX "vehicles_model_idx" ON "vehicles"("model");

-- CreateIndex
CREATE INDEX "vehicles_clientId_idx" ON "vehicles"("clientId");

-- CreateIndex
CREATE INDEX "vehicles_type_idx" ON "vehicles"("type");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_workshopId_plate_key" ON "vehicles"("workshopId", "plate");

-- CreateIndex
CREATE INDEX "service_histories_workshopId_idx" ON "service_histories"("workshopId");

-- CreateIndex
CREATE INDEX "service_histories_vehicleId_idx" ON "service_histories"("vehicleId");

-- CreateIndex
CREATE INDEX "service_histories_date_idx" ON "service_histories"("date");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_workOrderId_key" ON "budgets"("workOrderId");

-- CreateIndex
CREATE INDEX "budgets_workshopId_idx" ON "budgets"("workshopId");

-- CreateIndex
CREATE INDEX "budgets_clientId_idx" ON "budgets"("clientId");

-- CreateIndex
CREATE INDEX "budgets_vehicleId_idx" ON "budgets"("vehicleId");

-- CreateIndex
CREATE INDEX "budgets_status_idx" ON "budgets"("status");

-- CreateIndex
CREATE INDEX "budgets_code_idx" ON "budgets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "work_orders_serviceHistoryId_key" ON "work_orders"("serviceHistoryId");

-- CreateIndex
CREATE INDEX "work_orders_workshopId_idx" ON "work_orders"("workshopId");

-- CreateIndex
CREATE INDEX "work_orders_clientId_idx" ON "work_orders"("clientId");

-- CreateIndex
CREATE INDEX "work_orders_vehicleId_idx" ON "work_orders"("vehicleId");

-- CreateIndex
CREATE INDEX "work_orders_status_idx" ON "work_orders"("status");

-- CreateIndex
CREATE INDEX "work_orders_code_idx" ON "work_orders"("code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_histories" ADD CONSTRAINT "service_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_histories" ADD CONSTRAINT "service_histories_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_histories" ADD CONSTRAINT "service_histories_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_workshopId_fkey" FOREIGN KEY ("workshopId") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "budgets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
