import {
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
} from '@nestjs/common';

export class ImageUploadPipe extends ParseFilePipe {
  constructor() {
    super({
      validators: [
        new MaxFileSizeValidator({
          maxSize: 5 * 1024 * 1024,
        }),
        new FileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        }),
      ],
    });
  }
}
