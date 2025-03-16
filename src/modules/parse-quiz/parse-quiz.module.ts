import { Module } from '@nestjs/common';
import { ParseQuizService } from './parse-quiz.service';
import { ParseQuizController } from './parse-quiz.controller';

@Module({
  providers: [ParseQuizService],
  controllers: [ParseQuizController]
})
export class ParseQuizModule {}
