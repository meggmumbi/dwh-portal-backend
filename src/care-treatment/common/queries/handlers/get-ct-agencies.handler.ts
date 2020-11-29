import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCtAgenciesQuery } from '../impl/get-ct-agencies.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransHmisStatsTxcurr } from '../../entities/fact-trans-hmis-stats-txcurr.model';
import { Repository } from 'typeorm';

@QueryHandler(GetCtAgenciesQuery)
export class GetCtAgenciesHandler implements IQueryHandler<GetCtAgenciesQuery> {
    constructor(
        @InjectRepository(FactTransHmisStatsTxcurr, 'mssql')
        private readonly repository: Repository<FactTransHmisStatsTxcurr>
    ) {

    }

    async execute(query: GetCtAgenciesQuery): Promise<any> {
        const counties = this.repository.createQueryBuilder('q')
            .select(['distinct q.County agency'])
            .where('q.County IS NOT NULL');
        
        if (query.county) {
            counties.andWhere('q.County IN (:...county)', { county: query.county });
        }

        if (query.subCounty) {
            counties.andWhere('q.Subcounty IN (:...subCounty)', { subCounty: query.subCounty });
        }

        if (query.facility) {
            counties.andWhere('q.FacilityName IN (:...facility)', { facility: query.facility });
        }

        if (query.partner) {
            counties.andWhere('q.CTPartner IN (:...partner)', { partner: query.partner });
        }

        // if (query.agency) {
        //     counties.andWhere('q.agency IN (:...agency)', { agency: query.agency });
        // }

        // if (query.project) {
        //     counties.andWhere('q.project IN (:...project)', { project: query.project });
        // }

        return await counties.orderBy('q.County').getRawMany();
    }
}
