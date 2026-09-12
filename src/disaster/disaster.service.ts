import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disaster } from './entities/disaster.entity';
import { CreateDisasterDto } from './dto/create-disaster.dto';
import { UpdateDisasterDto } from './dto/update-disaster.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { Auth } from 'src/auth/entities/auth.entity';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';

@Injectable()
export class DisasterService {
	private readonly logger = new CustomLoggerService(DisasterService.name);

	constructor(
		@InjectRepository(Disaster)
		private readonly disasterRepo: Repository<Disaster>,
		@InjectRepository(Auth)
		private readonly authRepo: Repository<Auth>,
		private readonly mailerService: MailerService,
		private readonly auditService: AuditService,
	) {}

	async createDisaster(createDisasterDto: CreateDisasterDto): Promise<Disaster> {
		this.logger.log(`Creating disaster alert: ${createDisasterDto.disasterName}`);
		const disaster = this.disasterRepo.create({
			disaster_name: createDisasterDto.disasterName,
			impacted_location: createDisasterDto.impactedLocation,
			impact_time: new Date(createDisasterDto.impactTime),
			type: createDisasterDto.type,
			is_verified: false,
		});

		this.auditService.setCreated(disaster);
		const saved = await this.disasterRepo.save(disaster);

		const authRecords = await this.authRepo.find();

		await Promise.all(
			authRecords.map((a) =>
				this.mailerService
					.sendDisasterAlertEmail(
						a.email ?? null,
						saved.disaster_name,
						saved.impacted_location,
						saved.impact_time,
						saved.type,
					)
					.catch((err) => this.logger.error(`Failed to send disaster email to ${a.email}`, err)),
			),
		);

		return saved;
	}

	async findAll(): Promise<Disaster[]> {
		return await this.disasterRepo.find({
			order: { created_at: 'DESC' },
		});
	}

	async findOne(id: string): Promise<Disaster> {
		const disaster = await this.disasterRepo.findOne({ where: { id } });
		if (!disaster) {
			throw new EntityNotFoundException('Disaster', id);
		}
		return disaster;
	}

	async update(id: string, dto: UpdateDisasterDto): Promise<Disaster> {
		const disaster = await this.findOne(id);
		if (dto.disasterName) disaster.disaster_name = dto.disasterName;
		if (dto.impactedLocation) disaster.impacted_location = dto.impactedLocation;
		if (dto.impactTime) disaster.impact_time = new Date(dto.impactTime);
		if (dto.type) disaster.type = dto.type;

		this.auditService.setUpdated(disaster);
		return await this.disasterRepo.save(disaster);
	}

	async markAsSafe(id: string): Promise<Disaster> {
		const disaster = await this.findOne(id);
		disaster.is_verified = true;
		this.auditService.setUpdated(disaster);
		return await this.disasterRepo.save(disaster);
	}

	async remove(id: string): Promise<Disaster> {
		const disaster = await this.findOne(id);
		return await this.disasterRepo.remove(disaster);
	}
}

