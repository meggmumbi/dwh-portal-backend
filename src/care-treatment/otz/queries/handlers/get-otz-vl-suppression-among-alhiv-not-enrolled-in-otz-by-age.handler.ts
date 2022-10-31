import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransOtzEnrollments } from '../../entities/fact-trans-otz-enrollments.model';
import { Repository } from 'typeorm';
import { GetOtzVlSuppressionAmongAlhivNotEnrolledInOtzByAgeQuery } from '../impl/get-otz-vl-suppression-among-alhiv-not-enrolled-in-otz-by-age.query';

@QueryHandler(GetOtzVlSuppressionAmongAlhivNotEnrolledInOtzByAgeQuery)
export class GetOtzVlSuppressionAmongAlhivNotEnrolledInOtzByAgeHandler
    implements
        IQueryHandler<GetOtzVlSuppressionAmongAlhivNotEnrolledInOtzByAgeQuery> {
    constructor(
        @InjectRepository(FactTransOtzEnrollments, 'mssql')
        private readonly repository: Repository<FactTransOtzEnrollments>,
    ) {}

    async execute(
        query: GetOtzVlSuppressionAmongAlhivNotEnrolledInOtzByAgeQuery,
    ): Promise<any> {
        const vlSuppressionOtzByAge = this.repository
            .createQueryBuilder('f')
            .select([
                '[DATIM_AgeGroup] ageGroup, Last12MVLResult, SUM([Last12MonthVL]) AS vlSuppression',
            ])
            .andWhere(
                'f.MFLCode IS NOT NULL AND Last12MVLResult IS NOT NULL and OTZEnrollmentDate is Null',
            );

        if (query.county) {
            vlSuppressionOtzByAge.andWhere('f.County IN (:...counties)', {
                counties: query.county,
            });
        }

        if (query.subCounty) {
            vlSuppressionOtzByAge.andWhere('f.SubCounty IN (:...subCounties)', {
                subCounties: query.subCounty,
            });
        }

        if (query.facility) {
            vlSuppressionOtzByAge.andWhere(
                'f.FacilityName IN (:...facilities)',
                { facilities: query.facility },
            );
        }

        if (query.partner) {
            vlSuppressionOtzByAge.andWhere('f.CTPartner IN (:...partners)', {
                partners: query.partner,
            });
        }

        if (query.agency) {
            vlSuppressionOtzByAge.andWhere('f.CTAgency IN (:...agencies)', {
                agencies: query.agency,
            });
        }

        if (query.datimAgeGroup) {
            vlSuppressionOtzByAge.andWhere(
                'f.DATIM_AgeGroup IN (:...ageGroups)',
                { ageGroups: query.datimAgeGroup },
            );
        }

        if (query.gender) {
            vlSuppressionOtzByAge.andWhere('f.Gender IN (:...genders)', {
                genders: query.gender,
            });
        }

        return await vlSuppressionOtzByAge
            .groupBy('[DATIM_AgeGroup], Last12MVLResult')
            .orderBy('[DATIM_AgeGroup]')
            .getRawMany();
    }
}
