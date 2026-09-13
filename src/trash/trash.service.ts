import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { TrashItem } from './entities/trash-item.entity';
import { TrashItemType } from './enums/trash-item-type.enum';
import { MissingPerson } from 'src/missing-persons/entities/missing-person.entity';
import { RescueRequest } from 'src/rescue-requests/entities/rescue-request.entity';
import { CommunityPost } from 'src/community-posts/entities/community-post.entity';
import { PostStatus } from 'src/community-posts/enums/post-status.enum';
import { FilesService } from 'src/files/files.service';
import { AuditService, AuditTask } from 'src/common/audit/audit.service';

@Injectable()
export class TrashService {
  constructor(
    @InjectRepository(TrashItem)
    private readonly trashRepo: Repository<TrashItem>,
    @InjectRepository(MissingPerson)
    private readonly missingPersonRepo: Repository<MissingPerson>,
    @InjectRepository(RescueRequest)
    private readonly rescueRepo: Repository<RescueRequest>,
    @InjectRepository(CommunityPost)
    private readonly postRepo: Repository<CommunityPost>,
    private readonly filesService: FilesService,
    private readonly auditService: AuditService,
  ) {}

  private async purgeExpiredItems(): Promise<void> {
    try {
      await this.trashRepo.delete({
        expires_at: LessThan(new Date()),
      });
    } catch {}
  }

  async addToTrash(
    userId: string,
    itemType: TrashItemType,
    itemId: string,
    itemTitle: string,
    payload: Record<string, any>,
  ): Promise<TrashItem> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const trashItem = this.trashRepo.create({
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      item_title: itemTitle,
      payload,
      deleted_at: now,
      expires_at: expiresAt,
    });

    const saved = await this.trashRepo.save(trashItem);

    await this.auditService.logAudit(
      AuditTask.DELETE,
      userId,
      `Moved item to trash: ${itemTitle} (${itemType})`,
    );

    return saved;
  }

  async getUserTrash(userId: string) {
    await this.purgeExpiredItems();

    const items = await this.trashRepo.find({
      where: {
        user_id: userId,
        expires_at: MoreThan(new Date()),
      },
      order: {
        deleted_at: 'DESC',
      },
    });

    return items.map((item) => ({
      id: item.id,
      item_id: item.item_id,
      item_type: item.item_type,
      item_title: item.item_title,
      deleted_at: item.deleted_at,
      expires_at: item.expires_at,
    }));
  }

  async restore(trashId: string, userId: string, role: string) {
    const trashItem = await this.trashRepo.findOne({
      where: { id: trashId },
    });

    if (!trashItem) {
      throw new NotFoundException('Trash item not found or expired');
    }

    if (trashItem.user_id !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to restore this item',
      );
    }

    if (trashItem.item_type === TrashItemType.MISSING_PERSON) {
      const payload = trashItem.payload;
      const entity = this.missingPersonRepo.create(payload);
      this.auditService.setUpdated(entity, userId);
      await this.missingPersonRepo.save(entity);
    } else if (trashItem.item_type === TrashItemType.RESCUE_REQUEST) {
      const payload = trashItem.payload;
      const entity = this.rescueRepo.create(payload);
      this.auditService.setUpdated(entity, userId);
      await this.rescueRepo.save(entity);
    } else if (trashItem.item_type === TrashItemType.COMMUNITY_POST) {
      const existing = await this.postRepo.findOne({
        where: { id: trashItem.item_id },
      });
      if (existing) {
        existing.status = PostStatus.POSTED;
        this.auditService.setUpdated(existing, userId);
        await this.postRepo.save(existing);
      } else if (trashItem.payload) {
        const entity = this.postRepo.create({
          ...trashItem.payload,
          status: PostStatus.POSTED,
        });
        this.auditService.setUpdated(entity, userId);
        await this.postRepo.save(entity);
      }
    }

    await this.trashRepo.remove(trashItem);

    await this.auditService.logAudit(
      AuditTask.UPDATE,
      userId,
      `Restored item from trash: ${trashItem.item_title} (${trashItem.item_type})`,
    );

    return {
      message: `Item "${trashItem.item_title}" has been restored successfully.`,
    };
  }

  async deletePermanently(trashId: string, userId: string, role: string) {
    const trashItem = await this.trashRepo.findOne({
      where: { id: trashId },
    });

    if (!trashItem) {
      throw new NotFoundException('Trash item not found');
    }

    if (trashItem.user_id !== userId && role !== 'admin') {
      throw new ForbiddenException(
        'You do not have permission to permanently delete this item',
      );
    }

    if (trashItem.item_type === TrashItemType.MISSING_PERSON) {
      if (trashItem.payload?.photo_url) {
        try {
          await this.filesService.deleteFile(trashItem.payload.photo_url);
        } catch {}
      }
    } else if (trashItem.item_type === TrashItemType.COMMUNITY_POST) {
      if (
        trashItem.payload?.media_urls &&
        Array.isArray(trashItem.payload.media_urls)
      ) {
        for (const url of trashItem.payload.media_urls) {
          try {
            await this.filesService.deleteFile(url);
          } catch {}
        }
      }
    }

    await this.trashRepo.remove(trashItem);

    await this.auditService.logAudit(
      AuditTask.DELETE,
      userId,
      `Permanently deleted trash item: ${trashItem.item_title}`,
    );

    return {
      message: `Item "${trashItem.item_title}" permanently deleted.`,
    };
  }
}
