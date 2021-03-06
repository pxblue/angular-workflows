import { Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AUTH_ROUTES } from '../../auth/auth.routes';
import { PxbRegisterUIService } from '../../services/api';
import { PxbAuthSecurityService, SecurityContext } from '../../services/state/auth-security.service';
import { PxbCreateAccountInviteErrorDialogService } from '../../services/dialog/create-account-invite-error-dialog.service';
import { ErrorDialogData } from '../../services/dialog/error-dialog.service';
import { Subscription } from 'rxjs';
import { PxbAuthConfig } from '../../services/config/auth-config';
import { PxbAuthTranslations } from '../../translations/auth-translations';

import { CreateAccountService } from '../create-account/create-account.service';
import { AccountDetails } from '../create-account/create-account.component';
import { isEmptyView } from '../../util/view-utils';
import { RegistrationSuccessScreenContext } from '../create-account/steps/account-created/account-created.component';

const ACCOUNT_DETAILS_STARTING_PAGE = 2;

@Component({
    selector: 'pxb-create-account-invite',
    templateUrl: './create-account-invite.component.html',
    styleUrls: ['./create-account-invite.component.scss'],
})
export class PxbCreateAccountInviteComponent implements OnInit, OnDestroy {
    @Input() accountDetails: AccountDetails[] = [];
    @Input() registrationSuccessScreen: TemplateRef<any>;
    @Input() existingAccountSuccessScreen: TemplateRef<any>;

    @ViewChild('registrationLinkErrorTitleVC') registrationLinkErrorTitleEl;
    @ViewChild('registrationLinkErrorDescVC') registrationLinkErrorDescEl;

    isLoading: boolean;
    isValidRegistrationLink: boolean;
    isPXWhiteAccount: boolean;

    // EULA Page
    userAcceptsEula: boolean;

    // Create Password Page
    password: string;
    passwordMeetsRequirements: boolean;

    // Account Details Page
    validAccountName: boolean;
    firstName: string;
    lastName: string;

    stateListener: Subscription;
    registrationUtils: CreateAccountService;
    isEmpty = (el: ElementRef): boolean => isEmptyView(el);
    translate: PxbAuthTranslations;

    registrationSuccessScreenContext: RegistrationSuccessScreenContext;

    constructor(
        private readonly _router: Router,
        private readonly _pxbAuthConfig: PxbAuthConfig,
        private readonly _pxbRegisterService: PxbRegisterUIService,
        private readonly _pxbSecurityService: PxbAuthSecurityService,
        private readonly _pxbErrorDialogService: PxbCreateAccountInviteErrorDialogService
    ) {
        this.stateListener = this._pxbSecurityService.securityStateChanges().subscribe((state: SecurityContext) => {
            this.isLoading = state.isLoading;
        });
    }

    ngOnInit(): void {
        this.translate = this._pxbAuthConfig.getTranslations();
        this.validateRegistrationLink();
        this.registrationUtils = new CreateAccountService(ACCOUNT_DETAILS_STARTING_PAGE, this.accountDetails);
    }

    ngOnDestroy(): void {
        this.stateListener.unsubscribe();
    }

    validateRegistrationLink(): void {
        this._pxbSecurityService.setLoadingMessage('Validating registration link...');
        this._pxbSecurityService.setLoading(true);
        this._pxbRegisterService
            .validateUserRegistrationRequest()
            .then((registrationComplete) => {
                this._pxbSecurityService.setLoading(false);
                this.isValidRegistrationLink = true;
                this.isPXWhiteAccount = registrationComplete;
            })
            .catch((data: ErrorDialogData) => {
                this._pxbErrorDialogService.openDialog(data);
                this._pxbSecurityService.setLoading(false);
                this.isValidRegistrationLink = false;
            });
    }

    registerAccount(): void {
        this._pxbSecurityService.setLoading(true);
        const customForms = this.registrationUtils.getAccountDetailsCustomValues();
        this._pxbRegisterService
            .completeRegistration(this.firstName, this.lastName, customForms, this.password)
            .then(() => {
                this._pxbSecurityService.setLoading(false);
                this.registrationSuccessScreenContext = {
                    email: undefined,
                    firstName: this.firstName,
                    lastName: this.lastName,
                };
                for (const key of customForms.keys()) {
                    this.registrationSuccessScreenContext[key] = customForms.get(key).value;
                }
                this.registrationUtils.clearAccountDetails();
                this.registrationUtils.nextStep();
            })
            .catch((data: ErrorDialogData) => {
                this._pxbSecurityService.setLoading(false);
                this._pxbErrorDialogService.openDialog(data);
            });
    }

    attemptContinue(): void {
        if (this.canContinue()) {
            this.goNext();
        }
    }

    canContinue(): boolean {
        if (this.registrationUtils.isAccountDetailsPage()) {
            return this.registrationUtils.isFirstAccountDetailsPage()
                ? this.validAccountName && this.registrationUtils.hasValidAccountDetails()
                : this.registrationUtils.hasValidAccountDetails();
        }
        switch (this.registrationUtils.getCurrentPage()) {
            case 0:
                return this.userAcceptsEula;
            case 1:
                return this.passwordMeetsRequirements;
            default:
                return;
        }
    }

    goNext(): any {
        if (this.registrationUtils.isAccountDetailsPage()) {
            return this.registrationUtils.isLastAccountDetailsPage()
                ? this.registerAccount()
                : this.registrationUtils.nextStep();
        }
        return this.registrationUtils.nextStep();
    }

    goBack(): void {
        this.registrationUtils.getCurrentPage() === 0 ? this.navigateToLogin() : this.registrationUtils.prevStep();
    }

    navigateToLogin(): void {
        this.registrationUtils.clearAccountDetails();
        void this._router.navigate([`${AUTH_ROUTES.AUTH_WORKFLOW}/${AUTH_ROUTES.LOGIN}`]);
    }

    getUserName(): string {
        return `${this.firstName} ${this.lastName}`;
    }
}
