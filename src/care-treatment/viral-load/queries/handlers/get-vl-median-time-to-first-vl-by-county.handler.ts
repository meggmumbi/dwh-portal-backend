import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetVlMedianTimeToFirstVlByCountyQuery } from '../impl/get-vl-median-time-to-first-vl-by-county.query';
import { FactTimeToVlLast12M } from '../../entities/fact-time-to-vl-last-12m.model';

@QueryHandler(GetVlMedianTimeToFirstVlByCountyQuery)
export class GetVlMedianTimeToFirstVlByCountyHandler
    implements IQueryHandler<GetVlMedianTimeToFirstVlByCountyQuery> {
    constructor(
        @InjectRepository(FactTimeToVlLast12M, 'mssql')
        private readonly repository: Repository<FactTimeToVlLast12M>,
    ) {}

    async execute(query: GetVlMedianTimeToFirstVlByCountyQuery): Promise<any> {
        let medianTimeToFirstVlSql = this.repository
            .createQueryBuilder('f')
            .select(['County, MedianTimeToFirstVL_County medianTime'])
            .where('f.[County] IS NOT NULL')
            .andWhere('f.MFLCode IS NOT NULL');

        if (query.county) {
            medianTimeToFirstVlSql = this.repository
                .createQueryBuilder('f')
                .select([
                    'SubCounty County, MedianTimeToFirstVL_SbCty medianTime',
                ])
                .andWhere('f.County IN (:...counties)', {
                    counties: query.county,
                });

            return await medianTimeToFirstVlSql
                .groupBy('SubCounty, MedianTimeToFirstVL_SbCty')
                .orderBy('f.MedianTimeToFirstVL_SbCty', 'DESC')
                .getRawMany();
        }

        if (query.subCounty) {
            medianTimeToFirstVlSql = this.repository
                .createQueryBuilder('f')
                .select([
                    'County County, MedianTimeToFirstVL_County medianTime',
                ])
                .andWhere('f.SubCounty IN (:...subCounties)', {
                    subCounties: query.subCounty,
                });

            return await medianTimeToFirstVlSql
                .groupBy('County, MedianTimeToFirstVL_County')
                .orderBy('f.MedianTimeToFirstVL_County', 'DESC')
                .getRawMany();
        }

        if (query.partner) {
            medianTimeToFirstVlSql = this.repository
                .createQueryBuilder('f')
                .select([
                    'County County, MedianTimeToFirstVL_County medianTime',
                ])
                .andWhere('f.CTPartner IN (:...partners)', {
                    partners: query.partner,
                });

            return await medianTimeToFirstVlSql
                .groupBy('County, MedianTimeToFirstVL_County')
                .orderBy('f.MedianTimeToFirstVL_County', 'DESC')
                .getRawMany();
        }

        if (query.agency) {
            medianTimeToFirstVlSql = this.repository
                .createQueryBuilder('f')
                .select([
                    'County County, MedianTimeToFirstVL_County medianTime',
                ])
                .andWhere('f.CTAgency IN (:...agencies)', {
                    agencies: query.agency,
                });

            return await medianTimeToFirstVlSql
                .groupBy('County, MedianTimeToFirstVL_County')
                .orderBy('f.MedianTimeToFirstVL_County', 'DESC')
                .getRawMany();
        }

        if (query.datimAgeGroup) {
            medianTimeToFirstVlSql.andWhere(
                'f.DATIM_AgeGroup IN (:...ageGroups)',
                {
                    ageGroups: query.datimAgeGroup,
                },
            );
        }

        if (query.gender) {
            medianTimeToFirstVlSql.andWhere('f.Gender IN (:...genders)', {
                genders: query.gender,
            });
        }

        return await medianTimeToFirstVlSql
            .groupBy('County, MedianTimeToFirstVL_County')
            .orderBy('f.MedianTimeToFirstVL_County', 'DESC')
            .getRawMany();
    }
}
