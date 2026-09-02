import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { PractitionerAccessStatus } from "src/enum";
import { ClientPractitioner } from "src/practitioner/entity/client-practitioner.entity";

export class KitTransferDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    kitId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    practitionerEmail: string


    public toClientPractitionerEntity(userId: string, practitionerId: string){
        const data = new ClientPractitioner()
        data.userId = userId
        data.practitionerId = practitionerId
        data.reportAccess = PractitionerAccessStatus.GRANTED
        return data
    }
}