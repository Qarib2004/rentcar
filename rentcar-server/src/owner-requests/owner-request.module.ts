import { Module } from '@nestjs/common';
import { OwnerRequestsController } from './owner-request.controller';
import { OwnerRequestsService } from './owner-request.service';


@Module({
  controllers: [OwnerRequestsController],
  providers: [OwnerRequestsService],
  exports: [OwnerRequestsService],
})
export class OwnerRequestsModule {}