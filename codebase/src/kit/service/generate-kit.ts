import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bwipjs from 'bwip-js';
import * as qrcode from 'qrcode';
import { GeneratedKit } from '../entity/genrated-kit.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenerateKitService {
  private readonly logger = new Logger(GenerateKitService.name);
  private readonly CHUNK_SIZE = 200; // Define chunk size

  constructor(
    @InjectRepository(GeneratedKit)
    private readonly generatedKitRepo: Repository<GeneratedKit>,
  ) {}

  async executeMultiple(times: number, version: number) {
    try {
      const uniqueKitIds = new Set<string>();
      let kitsToSave = [];

      for (let i = 0; i < times; i++) {
        const kitId = this.generateKitId(version);

        if (!uniqueKitIds.has(kitId)) {
          uniqueKitIds.add(kitId);

          const data = JSON.stringify({
            'Register Kit': 'https://app.vitract.com/login',
          });

          const qrCodeDataURL = await qrcode.toDataURL(data);
          const barcodeDataURL = await this.generateBarcode(kitId);

          kitsToSave.push({
            kitId,
            qrCode: qrCodeDataURL,
            barCode: barcodeDataURL,
          });

          console.log(`Generated kit ${kitId}`);
        }

        // Save in chunks of 200
        if (kitsToSave.length >= this.CHUNK_SIZE) {
          await this.saveKitsChunk(kitsToSave);
          kitsToSave = []; // Reset batch
        }
      }

      // Save any remaining kits that didn't make it into a full chunk
      if (kitsToSave.length > 0) {
        await this.saveKitsChunk(kitsToSave);
      }

      console.log('All kits have been generated and saved successfully.');
    } catch (error) {
      this.logger.error(error);
      throw new Error('Failed to generate QR codes and barcodes.');
    }
  }

  protected generateKitId(version: number) {
    let letters = '';
    for (let i = 0; i < 3; i++) {
      letters += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    let digits = '';
    for (let i = 0; i < 2; i++) {
      digits += Math.floor(Math.random() * 10);
    }

    return `VT${version}-${letters}${digits}`;
  }

  private async generateBarcode(kitId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      bwipjs.toBuffer(
        {
          bcid: 'code128',
          text: kitId,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        },
        (err, png) => {
          if (err) {
            reject(err);
          } else {
            const base64Image = `data:image/png;base64,${png.toString('base64')}`;
            resolve(base64Image);
          }
        },
      );
    });
  }

  private async saveKitsChunk(kitsChunk: Array<Partial<GeneratedKit>>) {
    console.log(`Saving batch of ${kitsChunk.length} kits...`);
    await this.generatedKitRepo.save(kitsChunk);
    console.log('Batch saved successfully.');
  }
}
