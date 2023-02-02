import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCtTxCurrBySexQuery } from '../impl/get-ct-tx-curr-by-sex.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransHmisStatsTxcurr } from '../../entities/fact-trans-hmis-stats-txcurr.model';
import { Repository } from 'typeorm';
import { DimAgeGroups } from '../../../common/entities/dim-age-groups.model';
import { AggregateTXCurr } from './../../entities/aggregate-txcurr.model';

@QueryHandler(GetCtTxCurrBySexQuery)
export class GetCtTxCurrBySexHandler
    implements IQueryHandler<GetCtTxCurrBySexQuery> {
    constructor(
        @InjectRepository(AggregateTXCurr, 'mssql')
        private readonly repository: Repository<AggregateTXCurr>,
    ) {}

    async execute(query: GetCtTxCurrBySexQuery): Promise<any> {
        const txCurrBySex = this.repository
            .createQueryBuilder('f')
            .select(['[Gender], SUM([CountClientsTXCur]) txCurr'])
            // .innerJoin(DimAgeGroups, 'v', 'f.ageGroup = v.AgeGroup')
            .where('f.[Gender] IS NOT NULL');

        if (query.county) {
            txCurrBySex.andWhere('f.County IN (:...counties)', {
                counties: query.county,
            });
        }

        if (query.subCounty) {
            txCurrBySex.andWhere('f.Subcounty IN (:...subCounties)', {
                subCounties: query.subCounty,
            });
        }

        if (query.facility) {
            txCurrBySex.andWhere('f.FacilityName IN (:...facilities)', {
                facilities: query.facility,
            });
        }

        if (query.partner) {
            txCurrBySex.andWhere('f.CTPartner IN (:...partners)', {
                partners: query.partner,
            });
        }

        if (query.agency) {
            txCurrBySex.andWhere('f.CTAgency IN (:...agencies)', {
                agencies: query.agency,
            });
        }

        if (query.datimAgeGroup) {
            txCurrBySex.andWhere('f.DATIMAgeGroup IN (:...ageGroups)', {
                ageGroups: query.datimAgeGroup,
            });
        }

        if (query.gender) {
            txCurrBySex.andWhere('f.Gender IN (:...genders)', {
                genders: query.gender,
            });
        }

        return await txCurrBySex
            .groupBy('[Gender]')
            .orderBy('[Gender]')
            .getRawMany();
    }
}
