import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PXB_AUTH_CONFIG } from '../../config/auth-config';
import { ReactiveFormsModule } from '@angular/forms';
import { PxbChangePasswordComponent } from './change-password.component';
import { PxbChangePasswordModalService } from './change-password-modal.service';

describe('ChangePasswordComponent', () => {
    let component: PxbChangePasswordComponent;
    let fixture: ComponentFixture<PxbChangePasswordComponent>;

    beforeEach(async(() => {
        void TestBed.configureTestingModule({
            imports: [RouterTestingModule, ReactiveFormsModule],
            declarations: [PxbChangePasswordComponent],
            providers: [
                {
                    provide: PXB_AUTH_CONFIG,
                    useValue: PXB_AUTH_CONFIG,
                },
                {
                    provide: PxbChangePasswordModalService,
                    useValue: {},
                },
            ],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(PxbChangePasswordComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        void expect(component).toBeTruthy();
    });
});