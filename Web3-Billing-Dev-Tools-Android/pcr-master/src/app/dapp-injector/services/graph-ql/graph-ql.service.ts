import { Injectable, OnDestroy } from '@angular/core';
import { Apollo, QueryRef, gql } from 'apollo-angular';
import { BehaviorSubject, firstValueFrom, Subject, Subscription } from 'rxjs';
import { GET_REWARD, GET_MEMBERSHIP, GET_PROPOSALS, GET_INDEXES, GET_USER, GET_UPCOMING_REWARDS } from './queryDefinitions';



@Injectable({
  providedIn: 'root',
})
export class GraphQlService implements OnDestroy {
  constructor(private apollo: Apollo) {}
  ngOnDestroy(): void {}

  watchTokens(id: string) {
    const variables = { id: id };
    return this.apollo.watchQuery<any>({
      query: gql(GET_REWARD),
      pollInterval: 500,
      variables,
    }).valueChanges;
  }

  watchMemberships(id: string) {
    const variables = { id: id };
    return this.apollo.watchQuery<any>({
      query: gql(GET_MEMBERSHIP),
      pollInterval: 500,
      variables,
    }).valueChanges;
  }

  async queryUpcomingRewards():Promise<any> {
    try {
 
      const posts = await this.apollo
      .query<any>({
        query: gql(GET_UPCOMING_REWARDS)
      })
        .toPromise();

     
      return posts;
    } catch (error) {
      console.log(error);
      return {};
    }

  }

  async queryProposals(id:string):Promise<any> {
    try {

      const variables = { id };
      const posts = await this.apollo
      .query<any>({
        query: gql(GET_PROPOSALS),
        variables,
      })
        .toPromise();

     
      return posts;
    } catch (error) {
      console.log(error);
      return {};
    }

  }

  async queryIndexes(id:string):Promise<any> {
    try {
      const variables = { id };
      const posts = await this.apollo
        .query<any>({
          query: gql(GET_INDEXES),
          variables,
        })
        .toPromise();

     
      return posts!;
    } catch (error) {
      console.log(error);
      return {};
    }

    // this.querySubscription = this.postsQuery.valueChanges.subscribe(({ data, loading }) => {
    //   this.loading = loading;
    //   this.posts = data.posts;
    // });
  }

  queryUser(address: string) {
    const variables = { address: address.toLowerCase() };
    return this.apollo.watchQuery<any>({
      query: gql(GET_USER),
      variables,
    }).valueChanges;
  }
}
