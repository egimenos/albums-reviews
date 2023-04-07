import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsDate,
} from 'class-validator';

export class CreateAlbumDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(10)
  score: number;

  @IsDate()
  reviewDate: Date;
}
