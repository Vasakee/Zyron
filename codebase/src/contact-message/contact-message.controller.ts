import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpCode,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { ContactMessageService } from './service/contact-message.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SentryInterceptor } from '../sentry/sentry.interceptor';

@UseGuards(ThrottlerGuard)
@UseInterceptors(SentryInterceptor)
@ApiTags('Contact Messages')
@Controller('contacts')
export class ContactMessageController {
  constructor(private readonly contactService: ContactMessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', {}))
  @ApiOperation({
    summary: 'Submit contact form',
    description: 'Submit a contact form with optional file attachment',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Contact form data with optional file attachment',
    type: CreateContactMessageDto,
  })
  async submitContactForm(
    @Body() createContactDto: CreateContactMessageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    try {
      const contact = await this.contactService.handleContactSubmission(
        createContactDto,
        file,
      );

      return {
        success: true,
        message:
          'Contact form submitted successfully. We will get back to you soon!',
        data: {
          ...contact,
          name: contact.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all contact submissions (Admin)',
    description:
      'Retrieve all contact form submissions. Admin access required.',
  })
   @ApiResponse({
    status: 200,
    description: 'List of all contact submissions',
  })
  async getAllContacts() {
    const contacts = await this.contactService.findAll();
    return {
      success: true,
      data: contacts,
      total: contacts.length,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get contact submission by ID (Admin)',
    description:
      'Retrieve a specific contact form submission by its ID. Admin access required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Contact submission details',
  })
  @ApiResponse({
    status: 404,
    description: 'Contact not found',
  })
  async getContactById(@Param('id', ParseUUIDPipe) id: string) {
    const contact = await this.contactService.findOne(id);
    return {
      success: true,
      data: contact,
    };
  }
}
