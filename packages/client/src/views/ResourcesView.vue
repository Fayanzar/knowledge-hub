<script setup lang="ts">
import axios from 'axios'
import { onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { ResourceResponse } from '@/util/types';
import { TrashIcon } from '@heroicons/vue/24/solid';
import ResourceField from '@/composables/ResourceField.vue';
import TagAddField from '@/composables/TagAddField.vue';
import ResourceAddField from '@/composables/ResourceAddField.vue';
import { useStatsStore } from '@/stores/stats';

const authStore = useAuthStore();
const resources = ref<ResourceResponse[]>([])

const statsStore = useStatsStore();

onMounted(async () => {
  const uid = authStore.user?.id;
  if (uid == null) return;

  await axios.get(`/api/${uid}/resources`)
    .then(response => {
      resources.value = response.data;
    })
    .catch(error => {
      console.log(error);
    });
});

function deleteTag(rid: number, tid: number) {
  const uid = authStore.user?.id;
  if (uid == null) return;

  axios.delete(`/api/${rid}/tag/${tid}`)
    .then(_ => {
      statsStore.notifyDataChanged(['tag']);
    })
    .catch(error => {
      console.log(error);
    });

  const newResources = resources.value.map(val => {
    if (val['id'] == rid) {
      const newTags = val.tags.filter(tag => tag.id != tid);
      val.tags = newTags;
      return val
    } else return val;
  });

  resources.value = newResources;
}

async function refreshTags(newResource: ResourceResponse) {
  const uid = authStore.user?.id;
  if (uid == null) return;

  const newResources = resources.value.map(val => {
    if (val['id'] == newResource.id) {
      val = newResource;
      return val;
    } else return val;
  });

  resources.value = newResources;
}

function updateResources(id: number, value: string) {
  const newResources = resources.value.map(val => {
    if (val['id'] == id) {
      val['url'] = value;
      return val;
    } else return val
  });
  resources.value = newResources;

  const payload = {
    url: value
  }

  axios.put(`/api/resource/${id}`, payload)
    .then((_) => {})
    .catch(error => {
      console.log(error)
    })
}

function appendResource(resource : ResourceResponse) {
  const newResources = [...resources.value, resource];
  resources.value = newResources;
}

function removeResource(id: number) {
  const newResources = resources.value.filter(val => val.id != id);
  resources.value = newResources;
}
</script>

<template>
  <div class="flex-1 px-1 py-1">
    <table class="space-y-1">
      <tbody>
        <tr v-for="resource in resources" :key="resource.id" class="flex items-center gap-1 py-1">
          <td class="flex items-center gap-1 py-3">
            <ResourceField :url="resource.url" :resource-id="resource.id"
              @url-changed="updateResources"
              @resource-deleted="removeResource"
            />
          </td>
          <td class="flex flex-wrap items-center gap-1 py-3">
            <span v-for="tag in resource.tags" :key="tag.id" class="badge badge-primary text-nowrap relative tag-box">
              <component :is="TrashIcon" class="shrink-0 h-4 w-4 absolute -right-0.5 -translate-y-2 cursor-pointer trash-icon"
              @click="deleteTag(resource.id, tag.id)"
              />
              {{ tag.tag }}
            </span>
            <TagAddField :resource-id="resource.id" @tag-added="refreshTags"/>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex items-center gap-1 py-3">
      <ResourceAddField @resource-added="appendResource"/>
    </div>
  </div>
</template>

<style lang="css" scoped>
.trash-icon {
  display: none;
}

.tag-box:hover .trash-icon {
  display: block;
}
</style>
