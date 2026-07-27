import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReliefOrg } from './entities/relief-org.entity';
import { Donation } from './entities/donation.entity';
import { Shelter } from './entities/shelter.entity';
import { ShelterStatus } from './entities/shelter.entity';

import { CreateReliefOrgDto } from './dto/create-relief-org.dto';
import { UpdateReliefOrgDto } from './dto/update-relief-org.dto';
import { VerifyReliefOrgDto } from './dto/verify-relief-org.dto';
import { CreateDonationDto } from './dto/create-donation.dto';
import { UpdateDonationDto } from './dto/update-donation.dto';
import { CreateShelterDto } from './dto/create-shelter.dto';
import { UpdateShelterDto } from './dto/update-shelter.dto';

@Injectable()
export class ReliefOrgService {
  constructor(
    @InjectRepository(ReliefOrg)
    private readonly reliefOrgRepo: Repository<ReliefOrg>,

    @InjectRepository(Donation)
    private readonly donationRepo: Repository<Donation>,

    @InjectRepository(Shelter)
    private readonly shelterRepo: Repository<Shelter>,
  ) {}

  // ─────────────────────────────────────────────
  // RELIEF ORG — Profile & Verification
  // ─────────────────────────────────────────────

  /**
   * Register a new Relief Organization
   * userId আসে JWT token থেকে (Controller-এ @CurrentUser('id'))
   */
  async register(userId: string, dto: CreateReliefOrgDto): Promise<ReliefOrg> {
    // এই user আগে কোনো org register করেছে কিনা চেক করো
    const existing = await this.reliefOrgRepo.findOne({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException(
        'An organization is already registered for this user account.',
      );
    }

    const org = this.reliefOrgRepo.create({
      userId,             // JWT থেকে পাওয়া user id
      orgName: dto.orgName,
    });

    return await this.reliefOrgRepo.save(org);
  }

  /**
   * Get a single Relief Org by its ID
   */
  async findById(id: string): Promise<ReliefOrg> {
    const org = await this.reliefOrgRepo.findOne({
      where: { id },
      relations: { donations: true, shelters: true },
    });

    if (!org) {
      throw new NotFoundException(
        `Relief Organization with ID "${id}" not found.`,
      );
    }

    return org;
  }

  /**
   * Update organization name
   */
  async updateOrg(id: string, dto: UpdateReliefOrgDto): Promise<ReliefOrg> {
    const org = await this.findById(id);
    Object.assign(org, dto);
    return await this.reliefOrgRepo.save(org);
  }

  /**
   * Update verification status — Admin only
   */
  async verifyOrg(id: string, dto: VerifyReliefOrgDto): Promise<ReliefOrg> {
    const org = await this.findById(id);
    org.verificationStatus = dto.verificationStatus;
    return await this.reliefOrgRepo.save(org);
  }

  /**
   * Generate operations report for an org
   */
  async getReport(id: string): Promise<object> {
    const org = await this.findById(id);

    const donations = await this.donationRepo.find({
      where: { receivedById: id },
    });

    const shelters = await this.shelterRepo.find({
      where: { managedById: id },
    });

    const totalDonationAmount = donations.reduce(
      (sum, d) => sum + Number(d.amount),
      0,
    );

    const donationsByStatus = {
      pending: donations.filter((d) => d.status === 'pending').length,
      received: donations.filter((d) => d.status === 'received').length,
      cancelled: donations.filter((d) => d.status === 'cancelled').length,
    };

    const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
    const totalOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);

    const sheltersByStatus = {
      active: shelters.filter((s) => s.status === 'active').length,
      full: shelters.filter((s) => s.status === 'full').length,
      closed: shelters.filter((s) => s.status === 'closed').length,
    };

    return {
      organization: {
        id: org.id,
        orgName: org.orgName,
        verificationStatus: org.verificationStatus,
        registeredAt: org.createdAt,
      },
      donations: {
        totalCount: donations.length,
        totalAmountBDT: totalDonationAmount,
        byStatus: donationsByStatus,
      },
      shelters: {
        totalCount: shelters.length,
        totalCapacity,
        totalCurrentOccupancy: totalOccupancy,
        availableSpace: totalCapacity - totalOccupancy,
        byStatus: sheltersByStatus,
      },
      generatedAt: new Date(),
    };
  }

  // ─────────────────────────────────────────────
  // DONATIONS
  // ─────────────────────────────────────────────

  async createDonation(orgId: string, dto: CreateDonationDto): Promise<Donation> {
    await this.findById(orgId);

    const donation = this.donationRepo.create({
      donorId: dto.donorId,
      amount: dto.amount,
      method: dto.method,
      transactionRef: dto.transactionRef,
      receivedById: orgId,
    });

    return await this.donationRepo.save(donation);
  }

  async getDonations(orgId: string): Promise<Donation[]> {
    await this.findById(orgId);

    return await this.donationRepo.find({
      where: { receivedById: orgId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateDonation(
    orgId: string,
    donationId: string,
    dto: UpdateDonationDto,
  ): Promise<Donation> {
    const donation = await this.donationRepo.findOne({
      where: { id: donationId, receivedById: orgId },
    });

    if (!donation) {
      throw new NotFoundException(
        `Donation with ID "${donationId}" not found for this organization.`,
      );
    }

    donation.status = dto.status;
    return await this.donationRepo.save(donation);
  }

  // ─────────────────────────────────────────────
  // SHELTERS
  // ─────────────────────────────────────────────

  async createShelter(orgId: string, dto: CreateShelterDto): Promise<Shelter> {
    await this.findById(orgId);

    const shelter = this.shelterRepo.create({
      managedById: orgId,
      name: dto.name,
      location: dto.location,
      photoUrl: dto.photoUrl,
      gpsLat: dto.gpsLat,
      gpsLng: dto.gpsLng,
      capacity: dto.capacity,
    });

    return await this.shelterRepo.save(shelter);
  }

  async getShelters(orgId: string): Promise<Shelter[]> {
    await this.findById(orgId);

    return await this.shelterRepo.find({
      where: { managedById: orgId },
      order: { name: 'ASC' },
    });
  }

  async updateShelter(
    orgId: string,
    shelterId: string,
    dto: UpdateShelterDto,
  ): Promise<Shelter> {
    const shelter = await this.shelterRepo.findOne({
      where: { id: shelterId, managedById: orgId },
    });

    if (!shelter) {
      throw new NotFoundException(
        `Shelter with ID "${shelterId}" not found for this organization.`,
      );
    }

    const newCapacity = dto.capacity ?? shelter.capacity;
    const newOccupancy = dto.currentOccupancy ?? shelter.currentOccupancy;

    if (newOccupancy > newCapacity) {
      throw new BadRequestException(
        `Current occupancy (${newOccupancy}) cannot exceed capacity (${newCapacity}).`,
      );
    }

    Object.assign(shelter, dto);

    // Auto status: full যদি occupancy = capacity
    if (shelter.currentOccupancy >= shelter.capacity) {
      shelter.status = ShelterStatus.FULL;
    }

    // Auto status: active যদি occupancy কমে যায় (closed override হবে না)
    if (
      shelter.currentOccupancy < shelter.capacity &&
      shelter.status === ShelterStatus.FULL
    ) {
      shelter.status = ShelterStatus.ACTIVE;
    }

    return await this.shelterRepo.save(shelter);
  }

  async deleteShelter(orgId: string, shelterId: string): Promise<object> {
    const shelter = await this.shelterRepo.findOne({
      where: { id: shelterId, managedById: orgId },
    });

    if (!shelter) {
      throw new NotFoundException(
        `Shelter with ID "${shelterId}" not found for this organization.`,
      );
    }

    await this.shelterRepo.remove(shelter);
    return { message: `Shelter "${shelter.name}" has been successfully deleted.` };
  }
}
