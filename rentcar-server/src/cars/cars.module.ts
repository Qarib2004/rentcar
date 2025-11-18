import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  imports: [UploadsModule],
  controllers: [CarsController, CategoriesController],
  providers: [CarsService, CategoriesService],
  exports: [CarsService, CategoriesService],
})
export class CarsModule {}
