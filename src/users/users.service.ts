import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { JwtService } from 'src/jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dtos/verify-email.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    //데코레이터 빼먹으면 안됨!!
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    //dependency injection
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      //문법 변경된 부분 : where명시
      const exists = await this.users.findOne({ where: { email } });
      if (exists) {
        return { ok: false, error: 'There is a user with that email already' };
      }
      const user = await this.users.save(
        this.users.create({ email, password, role }),
      );
      const verification = await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: "Couldn't create account" };
    }
    //check new user
    //create user & hash the password
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    //find the user with the email
    //check if the password is correct
    //make a JWT and give it to the user
    try {
      const user = await this.users.findOne({
        where: { email },
        select: ['id', 'password'],
      });
      if (!user) {
        return {
          ok: false,
          error: 'User nof found',
        };
      }
      //repotsitory상의 user가 아닌, users class로 생성된 위의 'user'임 차의에 유의
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: 'Wrong password',
        };
      }
      //토큰생성
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({
        where: { id },
      });
      return {
        ok: true,
        user,
      };
    } catch (error) {
      return {
        ok: false,
        error: '유저가 존재하지 않습니다',
      };
    }
  }

  //로그인 한 경우가 아니면 유저정보를 수정하려 하지 않을 것임
  async editProfile(
    id: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    //?db존재 여부와 관계없이 수행
    //!save vs update
    //?update의 경우 rest syntax를 활용해서 입력값을 넘긴다(why?)
    // return this.users.update({ id: userId }, { ...editProfileInput });
    try {
      const user = await this.users.findOne({ where: { id } });
      if (email) {
        user.email = email;
        user.verified = false;
        //todo 로직 수정한 부분 복습 필요(testing editProfile resolver)
        await this.verifications.delete({ user: { id: user.id } });
        const verification = await this.verifications.save(
          this.verifications.create({ user }),
        );
        this.mailService.sendVerificationEmail(user.email, verification.code);
      }
      if (password) {
        user.password = password;
      }
      this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '프로필을 업데이트 하지 못했어요',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    try {
      const verification = await this.verifications.findOne({
        where: { code },
        //id만 받아오기
        //loadRelationIds: true,
        //전체받아오기
        relations: ['user'],
      });
      if (verification) {
        verification.user.verified = true;
        await this.users.save(verification.user);
        await this.verifications.delete(verification.id);
        return {
          ok: true,
        };
      }
      return {
        ok: false,
        error: 'Verification not found.',
      };
    } catch (error) {
      return {
        ok: false,
        error: '인증에 실패했어요',
      };
    }
  }
}
