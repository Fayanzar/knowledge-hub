<script setup lang="ts">
import axios from 'axios'
import { nextTick, ref, useTemplateRef, watch } from 'vue';
import { PlusIcon, CheckIcon } from '@heroicons/vue/24/solid';
import type { ResourceResponse } from '@/util/types';
import { useStatsStore } from '@/stores/stats';

const props = defineProps<{
  resourceId: number
}>();

const emit = defineEmits<{
  tagAdded: [newResource: ResourceResponse]
}>();

const isAdding = ref(false);
const editInput = useTemplateRef("editInput");

const newTagValue = ref("");

const statsStore = useStatsStore();

async function toggleAddMode() {
  isAdding.value = !isAdding.value;

  if (isAdding.value) {
    await nextTick();
    if (editInput.value != null)
      editInput.value.focus();
  }
}

async function save() {
  const payload = {
    tag: editInput.value?.value
  }

  axios.post(`/api/${props.resourceId}/tag`, payload)
    .then((response) => {
      emit("tagAdded", response.data);
      statsStore.notifyDataChanged(['tag']);
    })
    .catch(error => {
      console.log(error)
    });

  isAdding.value = false;
  newTagValue.value = "";
}
</script>

<template>
  <input v-if="isAdding"
    type="text"
    v-model="newTagValue"
    @blur="toggleAddMode()"
    ref="editInput"
    class="w-30 input h-6"
  />
  <component v-if="isAdding" :is="CheckIcon" class="shrink-0 h-5 w-5 fill-green-400 cursor-pointer"
    @mousedown.prevent="save"
  />
  <component v-else :is="PlusIcon" class="shrink-0 h-5 w-5 fill-green-400 cursor-pointer"
    @click="toggleAddMode"
  />
</template>
