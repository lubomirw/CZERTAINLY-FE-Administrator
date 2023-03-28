// tslint:disable
/**
 * CZERTAINLY Core API
 * REST API for CZERTAINLY Core
 *
 * The version of the OpenAPI document: 1.6.1-SNAPSHOT
 * Contact: getinfo@czertainly.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import type { Observable } from 'rxjs';
import type { AjaxResponse } from 'rxjs/ajax';
import { BaseAPI, throwIfNullOrUndefined } from '../runtime';
import type { OperationOpts, HttpHeaders } from '../runtime';
import type {
    AddUserRequestDto,
    AuthenticationServiceExceptionDto,
    ErrorMessageDto,
    UserDetailDto,
} from '../models';

export interface AddAdminRequest {
    addUserRequestDto: AddUserRequestDto;
}

/**
 * no description
 */
export class LocalOperationsApi extends BaseAPI {

    /**
     * Create Administrator
     */
    addAdmin({ addUserRequestDto }: AddAdminRequest): Observable<UserDetailDto>
    addAdmin({ addUserRequestDto }: AddAdminRequest, opts?: OperationOpts): Observable<AjaxResponse<UserDetailDto>>
    addAdmin({ addUserRequestDto }: AddAdminRequest, opts?: OperationOpts): Observable<UserDetailDto | AjaxResponse<UserDetailDto>> {
        throwIfNullOrUndefined(addUserRequestDto, 'addUserRequestDto', 'addAdmin');

        const headers: HttpHeaders = {
            'Content-Type': 'application/json',
        };

        return this.request<UserDetailDto>({
            url: '/v1/local/admins',
            method: 'POST',
            headers,
            body: addUserRequestDto,
        }, opts?.responseOpts);
    };

}
