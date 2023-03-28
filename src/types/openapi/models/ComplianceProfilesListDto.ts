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

import type {
    ComplianceProviderSummaryDto,
} from './';

/**
 * @export
 * @interface ComplianceProfilesListDto
 */
export interface ComplianceProfilesListDto {
    /**
     * Object identifier
     * @type {string}
     * @memberof ComplianceProfilesListDto
     */
    uuid: string;
    /**
     * Object Name
     * @type {string}
     * @memberof ComplianceProfilesListDto
     */
    name: string;
    /**
     * Compliance Profile description
     * @type {string}
     * @memberof ComplianceProfilesListDto
     */
    description?: string;
    /**
     * Rules summary
     * @type {Array<ComplianceProviderSummaryDto>}
     * @memberof ComplianceProfilesListDto
     */
    rules: Array<ComplianceProviderSummaryDto>;
}
