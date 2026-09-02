/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  googleLogin(req) {
    if (!req.user) {
      return 'NO USER FROM Google';
    }
    return {
      message: 'user Info from Google  ',
      user: req.user,
    };
  }

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth(page: string) {
    const pageNumber = page ? page : 1;
    const response = await axios.get(
      `https://api.nhs.uk/conditions?page=${pageNumber}`,
      {
        headers: {
          'subscription-key': '9ea13bf4e9014e28be9b49880677b6e3',
        },
      },
    );

    let result = [];

    const datas = response.data.significantLink;

    for (const data of datas) {
      if (data.mainEntityOfPage.genre.includes('Symptom')) {
        result.push({
          name: data.name,
          description: data.description,
          url: data.url,
          // genre: data.mainEntityOfPage.genre,
        });
      }
    }

    return result;
  }
}
