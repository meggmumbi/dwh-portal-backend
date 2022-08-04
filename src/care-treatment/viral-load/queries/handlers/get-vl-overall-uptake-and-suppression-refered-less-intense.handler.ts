import { InjectRepository } from '@nestjs/typeorm';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Repository } from 'typeorm';
import { FactTransNewCohort } from '../../../new-on-art/entities/fact-trans-new-cohort.model';
import { GetVlOverallUptakeAndSuppressionReferredLessIntenseQuery } from '../impl/get-vl-overall-uptake-and-suppression-referred-less-intense.query';

@QueryHandler(GetVlOverallUptakeAndSuppressionReferredLessIntenseQuery)
export class GetVlOverallUptakeAndSuppressionReferedLessIntenseHandler
    implements
        IQueryHandler<
            GetVlOverallUptakeAndSuppressionReferredLessIntenseQuery
        > {
    constructor(
        @InjectRepository(FactTransNewCohort, 'mssql')
        private readonly repository: Repository<FactTransNewCohort>,
    ) {}

    async execute(
        query: GetVlOverallUptakeAndSuppressionReferredLessIntenseQuery,
    ): Promise<any> {
        const vlOverallUptakeAndSuppressionLessIntense = this.repository
            .createQueryBuilder('f')
            .select([
                `LastVL, lastVLDate, CASE WHEN ISNUMERIC(LastVL)=1 THEN CASE WHEN CAST(Replace(LastVL,',','')AS FLOAT) <=50.90 THEN '<50 Copies' WHEN CAST(Replace(LastVL,',','') AS FLOAT) between 51.00 and 399.00 THEN '51-399' WHEN CAST(Replace(LastVL,',','')AS FLOAT) between 400.00 and 999.00 THEN '400-999' WHEN CAST(Replace(LastVL,',','')AS FLOAT) >=1000 THEN '>1000 Copies' END WHEN LastVL IN ('undetectable','NOT DETECTED','0 copies/ml','LDL','ND','Target Not Detected',' Not detected','Target Not Detected.','Less than Low Detectable Level') THEN '<50 Copies' ELSE NULL END AS [Last12MVLResult], DifferentiatedCare`,
            ])
            .where(
                "ARTOutcome='V' and DATEDIFF(MONTH,lastVLDate,GETDATE())<= 14 and DifferentiatedCare<>'Not Documented'",
            );

        // const vlOverallUptakeAndSuppressInLessIntense = "With DC AS ( SELECT LastVL, lastVLDate, CASE WHEN ISNUMERIC(LastVL)=1 THEN CASE WHEN CAST(Replace(LastVL,',','')AS FLOAT) <=50.90 THEN '<50 Copies' WHEN CAST(Replace(LastVL,',','') AS FLOAT) between 51.00 and 399.00 THEN '51-399' WHEN CAST(Replace(LastVL,',','')AS FLOAT) between 400.00 and 999.00 THEN '400-999' WHEN CAST(Replace(LastVL,',','')AS FLOAT) >=1000 THEN '>1000 Copies' END WHEN LastVL IN ('undetectable','NOT DETECTED','0 copies/ml','LDL','ND','Target Not Detected',' Not detected','Target Not Detected.','Less than Low Detectable Level') THEN '<50 Copies' ELSE NULL END AS [Last12MVLResult], DifferentiatedCare FROM PortalDev.dbo.Fact_Trans_New_Cohort where ARTOutcome='V' and DATEDIFF(MONTH,lastVLDate,GETDATE())<= 14 and DifferentiatedCare<>'Not Documented') SELECT count (DifferentiatedCare) Num FROM DC where Last12MVLResult in ('<50 Copies','400-999','51-399')"

        if (query.county) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.County IN (:...counties)',
                { counties: query.county },
            );
        }

        if (query.subCounty) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.SubCounty IN (:...subCounties)',
                { subCounties: query.subCounty },
            );
        }

        if (query.facility) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.FacilityName IN (:...facilities)',
                { facilities: query.facility },
            );
        }

        if (query.partner) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.CTPartner IN (:...partners)',
                { partners: query.partner },
            );
        }

        if (query.agency) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.CTAgency IN (:...agencies)',
                { agencies: query.agency },
            );
        }

        if (query.datimAgeGroup) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.DATIM_AgeGroup IN (:...ageGroups)',
                { ageGroups: query.datimAgeGroup },
            );
        }

        if (query.gender) {
            vlOverallUptakeAndSuppressionLessIntense.andWhere(
                'f.Gender IN (:...genders)',
                { genders: query.gender },
            );
        }

        const originalQuery = vlOverallUptakeAndSuppressionLessIntense.getQuery;
        const originalParams =
            vlOverallUptakeAndSuppressionLessIntense.getParameters;
        vlOverallUptakeAndSuppressionLessIntense.getQuery = () => {
            const a = originalQuery.call(
                vlOverallUptakeAndSuppressionLessIntense,
            );
            return `WITH DC AS (${a}) SELECT count (DifferentiatedCare) Num FROM DC WHERE Last12MVLResult in ('<50 Copies','400-999','51-399')`;
        };
        vlOverallUptakeAndSuppressionLessIntense.getParameters = () => {
            return originalParams.call(
                vlOverallUptakeAndSuppressionLessIntense,
            );
        };

        return vlOverallUptakeAndSuppressionLessIntense.getRawMany();
    }
}
