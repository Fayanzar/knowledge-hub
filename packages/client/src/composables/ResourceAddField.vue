<script setup lang="ts">
import axios from 'axios'
import { useAuthStore } from '@/stores/auth';
import { nextTick, ref, useTemplateRef } from 'vue';
import { PlusIcon, CheckIcon } from '@heroicons/vue/24/solid';
import type { ResourceResponse } from '@/util/types';
import { useStatsStore } from '@/stores/stats';

const emit = defineEmits<{
  resourceAdded: [resource: ResourceResponse]
}>();

const isAdding = ref(false);
const editInput = useTemplateRef("editInput");

const newResourceUrl = ref("");
const authStore = useAuthStore();
const statsStore = useStatsStore();

async function toggleAddMode() {
  isAdding.value = !isAdding.value;

  if (isAdding.value) {
    await nextTick();
    if (editInput.value != null)
      editInput.value.focus();
  }
}

async function validateAndSave() {
  const uid = authStore.user?.id;
  if (uid == null) return;

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      console.error("bad url");
      return false;
    }
  }

  if (isValidUrl(newResourceUrl.value)) {

    const payload = {
      url: editInput.value?.value
    }

    axios.post(`/api/${uid}/resource`, payload)
      .then((response) => {
        const newResource : ResourceResponse = {
          id: response.data['id'],
          url: payload.url || "",
          userId: uid,
          tags: []
        }
        emit("resourceAdded", newResource);
        isAdding.value = false;
        statsStore.notifyDataChanged(['resource']);
      })
      .catch(error => {
        console.log(error)
      });
  } else {
    isAdding.value = true;
    await nextTick();
    editInput.value?.focus();
    editInput.value?.classList.add("input-error");
  }
}
</script>

<template>
  <input v-if="isAdding"
    type="text"
    v-model="newResourceUrl"
    @blur="toggleAddMode()"
    ref="editInput"
    class="w-30 input h-6"
  />
  <component v-if="isAdding" :is="CheckIcon" class="shrink-0 h-5 w-5 fill-green-400 cursor-pointer"
    @mousedown.prevent="validateAndSave"
  />
  <component v-else :is="PlusIcon" class="shrink-0 h-5 w-5 fill-green-400 cursor-pointer"
    @click="toggleAddMode"
  />
</template>
