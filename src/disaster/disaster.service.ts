import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disaster } from './entities/disaster.entity';
import { CreateDisasterDto } from './dto/create-disaster.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { Auth } from 'src/auth/entities/auth.entity';
import { CustomLoggerService } from 'src/common/logger/logger.service';
import { AuditService } from 'src/common/audit/audit.service';

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
}
