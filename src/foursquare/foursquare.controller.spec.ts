import { Test, TestingModule } from '@nestjs/testing';
import { FoursquareController } from './foursquare.controller';

describe('FoursquareController', () => {
  let controller: FoursquareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FoursquareController],
    }).compile();

    controller = module.get<FoursquareController>(FoursquareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
