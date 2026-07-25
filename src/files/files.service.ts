import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface SaveFileOptions {
  subFolder: string;
  allowedMimeTypes?: string[];
  customFileName?: string;
}

@Injectable()
export class FilesService {
  private readonly baseUploadPath = path.join(process.cwd(), 'user-files');

  async saveFiles(
    files: Express.Multer.File[],
    options: SaveFileOptions,
  ): Promise<string[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
        if (!options.allowedMimeTypes.includes(file.mimetype)) {
          throw new BadRequestException(
            `Invalid file type ${file.mimetype}. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
          );
        }
      }

      const targetDir = path.join(this.baseUploadPath, options.subFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const customName = options.customFileName
        ? files.length > 1
          ? `${options.customFileName}_${i + 1}`
          : options.customFileName
        : `file-${Date.now()}-${Math.round(Math.random() * 1e9)}`;

      const filename = `${customName}${ext}`;
      const filePath = path.join(targetDir, filename);

      await fs.promises.writeFile(filePath, file.buffer);

      const relativeUrl = `/user-files${options.subFolder}/${filename}`.replace(/\\/g, '/');
      urls.push(relativeUrl);
    }

    return urls;
  }

  async deleteFile(relativePath: string): Promise<boolean> {
    try {
      if (!relativePath) return false;
      const cleanPath = relativePath.replace(/^\/user-files/, '');
      const fullPath = path.join(this.baseUploadPath, cleanPath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }
}
