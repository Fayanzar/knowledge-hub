import { defineStore } from 'pinia'
import { getTagsWithCount, colorTags, getTagCount, getResourceCount } from '@/util/stats'
import type { Stats } from '@/util/stats'
import { useAuthStore } from '@/stores/auth';

interface StatsState {
  version: number,
  stats: Stats,
  loading: boolean,
  lastFetchedVersion: number
  updateRec: Record<UpdateDatatype, StatsUpdate>
}

class StatsUpdate {
  private shouldUpdate: boolean;
  updateFunction: (uid : string, stats : Stats) => Promise<void>;

  constructor(updateFunction : (uid : string, stats : Stats) => Promise<void>) {
    this.shouldUpdate = true;
    this.updateFunction = updateFunction;
  }

  queueUpdate() {
    this.shouldUpdate = true;
  }
  async performUpdate(uid : string, stats : Stats) {
    if (!this.shouldUpdate) return;
    await this.updateFunction(uid, stats)
    this.shouldUpdate = false;
  }
}

async function updateTags(uid : string, stats : Stats) {
  const coloredTags = colorTags(await getTagsWithCount(uid));
  const tagCount = await getTagCount(uid);
  stats.tagsWithCount = coloredTags;
  stats.tagCount = tagCount;
}

async function updateResources(uid : string, stats : Stats) {
  const resourceCount = await getResourceCount(uid);
  stats.resourceCount = resourceCount;
}

export type UpdateDatatype = 'tag' | 'resource';

const defaultStats : Stats = {
  tagsWithCount: [],
  tagCount: 0,
  resourceCount: 0,
  unreadResourceCount: 45, //placeholder

  displayedTags() {
    return this.tagsWithCount.slice(0, 5);
  }
}

export const useStatsStore = defineStore('stats', {

  state: (): StatsState => ({
    version: 0,
    stats: defaultStats,
    loading: false,
    lastFetchedVersion: -1,
    updateRec:  {
      tag: new StatsUpdate(updateTags),
      resource: new StatsUpdate(updateResources)
    }
  }),

  actions: {
    notifyDataChanged(updateTypes : UpdateDatatype[]) {
      updateTypes.forEach(updateType => this.updateRec[updateType].queueUpdate());
      this.version++;
    },

    async fetchStatsIfStale() {
      const authStore = useAuthStore();
      const uid = authStore.user?.id;
      if (uid == null) return;
      if (this.version == this.lastFetchedVersion) return;

      this.loading = true;
      try {
        Object.values(this.updateRec)
          .forEach(async statsUpdate => await statsUpdate.performUpdate(uid, this.stats))
        this.lastFetchedVersion = this.version
      } finally {
        this.loading = false;
      }
    }
  }
})
