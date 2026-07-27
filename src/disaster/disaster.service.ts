import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disaster } from './entities/disaster.entity';
import { CreateDisasterDto } from './dto/create-disaster.dto';
import { MailerService } from 'src/mailer/mailer.service';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class DisasterService {
	constructor(
		@InjectRepository(Disaster)
		private readonly disasterRepo: Repository<Disaster>,
		@InjectRepository(Auth)
		private readonly authRepo: Repository<Auth>,
		private readonly mailerService: MailerService,
	) {}

	async createDisaster(createDisasterDto: CreateDisasterDto): Promise<Disaster> {
		const disaster = this.disasterRepo.create({
			disaster_name: createDisasterDto.disasterName,
			impacted_location: createDisasterDto.impactedLocation,
			impact_time: new Date(createDisasterDto.impactTime),
			type: createDisasterDto.type,
			is_verified: false,
		});

		const saved = await this.disasterRepo.save(disaster);

		const authRecords = await this.authRepo.find();

		// send email to all registered users (best-effort; do not fail on email errors)
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
					.catch((err) => console.error('Failed to send disaster email to', a.email, err)),
			),
		);

		return saved;
	}
}
