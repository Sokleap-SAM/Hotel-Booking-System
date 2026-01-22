import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BedType } from './entities/bed-type.entity';
import { CreateBedTypeDto } from './dto/create-bed-type.dto';
import { UpdateBedTypeDto } from './dto/update-bed-type.dto';

@Injectable()
export class BedTypesService implements OnModuleInit {
  constructor(
    @InjectRepository(BedType)
    private bedTypeRepository: Repository<BedType>,
  ) {}

  async onModuleInit() {
    const count = await this.bedTypeRepository.count();

    if (count === 0) {
      const initialBedTypes = [
        {
          name: 'Single Bed',
        },
        {
          name: 'Double Bed',
        },
        {
          name: 'Queen Bed',
        },
        {
          name: 'King Bed',
        },
        {
          name: 'Twin Beds',
        },
      ];

      await this.bedTypeRepository.save(initialBedTypes);
      console.log('Bed types initialized!');
    }
  }

  async create(createBedTypeDto: CreateBedTypeDto): Promise<BedType> {
    const existing = await this.bedTypeRepository.findOne({
      where: { name: createBedTypeDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Bed type with name "${createBedTypeDto.name}" already exists`,
      );
    }

    const bedType = this.bedTypeRepository.create(createBedTypeDto);
    return await this.bedTypeRepository.save(bedType);
  }

  async findAll(): Promise<BedType[]> {
    return await this.bedTypeRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BedType> {
    const bedType = await this.bedTypeRepository.findOne({
      where: { id },
    });

    if (!bedType) {
      throw new NotFoundException(`Bed type with ID ${id} not found`);
    }

    return bedType;
  }

  async update(
    id: number,
    updateBedTypeDto: UpdateBedTypeDto,
  ): Promise<BedType> {
    const bedType = await this.findOne(id);

    if (updateBedTypeDto.name && updateBedTypeDto.name !== bedType.name) {
      const existing = await this.bedTypeRepository.findOne({
        where: { name: updateBedTypeDto.name },
      });

      if (existing) {
        throw new ConflictException(
          `Bed type with name "${updateBedTypeDto.name}" already exists`,
        );
      }
    }

    Object.assign(bedType, updateBedTypeDto);
    return await this.bedTypeRepository.save(bedType);
  }

  async remove(id: number): Promise<void> {
    const bedType = await this.findOne(id);
    await this.bedTypeRepository.remove(bedType);
  }
}
