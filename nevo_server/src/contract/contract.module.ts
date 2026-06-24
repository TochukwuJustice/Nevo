import { Module } from '@nestjs/common';
import { ContractService } from './contract.service.js';

@Module({
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
