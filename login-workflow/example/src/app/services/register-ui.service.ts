/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { IPxbRegisterUIService, PxbAuthSecurityService } from '@pxblue/angular-auth-workflow';
import { SAMPLE_EULA } from '../constants/sampleEula';

const TIMEOUT_MS = 1500;

@Injectable({
    providedIn: 'root',
})
export class RegisterUIService implements IPxbRegisterUIService {
    constructor(private readonly _pxbSecurityService: PxbAuthSecurityService) {}

    validateUserRegistrationRequest(code?: string): Promise<void> {
        const urlParams = new URLSearchParams(window.location.search);
        const registrationCode = code || urlParams.get('code');
        console.log(
            `Performing a sample ValidateUserRegistration request with the following credentials:\n code: ${registrationCode}`
        );
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!registrationCode
                  || registrationCode.toUpperCase() === 'INVALID_LINK'
                  || registrationCode.toUpperCase() === 'FAIL') {
                    return reject();
                }
                return resolve();
            }, TIMEOUT_MS);
        });
    }

    loadEULA(): Promise<string> {
        const urlParams = new URLSearchParams(window.location.search);
        const registrationCode = urlParams.get('code');
        console.log(`Performing a sample loadEULA request.`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (registrationCode && registrationCode.toUpperCase() === 'EULA_FAIL') {
                    return reject();
                }
                return resolve(SAMPLE_EULA);
            }, TIMEOUT_MS);
        });
    }

  requestRegistrationCode(email: string): Promise<void> {
    console.log(
      `Performing a sample RequestRegistrationCode request with the following credentials:\n email: ${email}`
    );
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email.toUpperCase() === 'FAIL@TEST.COM') {
          return reject();
        }
        return resolve();
      }, TIMEOUT_MS);
    });
  }

    completeRegistration(firstName: string, lastName: string, phoneNumber: string, password: string, validationCode?: string, email?: string): Promise<void> {
        console.log(
            `Performing a sample CompleteRegistration request with the following credentials:\n firstName: ${firstName}\n lastName: ${lastName}\n phoneNumber: ${phoneNumber}\n password: ${password}\n validationCode: ${validationCode}\n email: ${email}`
        );
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (firstName.toUpperCase() === 'FAIL' || lastName.toUpperCase() === 'FAIL') {
                    return reject();
                }
                this._pxbSecurityService.updateSecurityState({ email: 'sample-email@test.com' });
                return resolve();
            }, TIMEOUT_MS);
        });
    }
}
