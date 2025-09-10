import { Injectable } from '@nestjs/common';

enum TransportationMode {
	Car = 'car',
	Bicycle = 'bicycle',
	Bus = 'bus',
	Train = 'train',
	Walking = 'walking',
	Taxi = 'taxi',
	Other = 'other'
}

@Injectable()
export class AppService {


	getHello(): string {
		return 'Hello World!';
	}
}
