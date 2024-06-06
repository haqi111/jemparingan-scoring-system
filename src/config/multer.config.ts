/* eslint-disable prettier/prettier */
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Request } from 'express';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      const type = req.url.split('/').pop();
      const uploadPath = `./uploads/${type}`;

      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      return cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new BadRequestException('Only CSV files are allowed'), false);
    }
    cb(null, true);
  },
};
