<script setup lang="ts">
import axios from 'axios'
import { onMounted, onUnmounted, ref, nextTick, useTemplateRef } from 'vue';
import { useAuthStore } from '@/stores/auth';
import type { TagResponse } from '@/util/types';
import TagField from '@/composables/TagField.vue';
import { TrashIcon } from '@heroicons/vue/24/solid';
import { useConfirm } from '@/util/useConfirm';
import { useStatsStore } from '@/stores/stats';

const authStore = useAuthStore();
const tags = ref<TagResponse[]>([]);
const { confirm } = useConfirm();

const statsStore = useStatsStore();

onMounted(async () => {
  const uid = authStore.user?.id;
  if (uid == null) return;

  await axios.get(`/api/${uid}/usertags`)
    .then(response => {
      tags.value = response.data;
    })
    .catch(error => {
      console.log(error);
    });
});

function updateTag(id: number, value: string) {
  const newTags = tags.value.map(val => {
    if (val['id'] == id) {
      val['tag'] = value;
      return val;
    } else return val
  });
  tags.value = newTags;

  const payload = {
    tag: value
  }

  axios.put(`/api/tag/${id}`, payload)
    .then((_) => {
      statsStore.notifyDataChanged(['tag']);
    })
    .catch(error => {
      console.log(error)
    });
}

async function deleteTag(tid: number) {
  const uid = authStore.user?.id;
  if (uid == null) return;

  const { confirmed } = await confirm({
    title: 'Delete tag?',
    message: "It will be permanently deleted.",
    confirmText: 'Delete',
    cancelText: 'Keep it',
    danger: true,
  })

  if (!confirmed) return;

  axios.delete(`/api/tag/${tid}`)
    .then(_ => {
      statsStore.notifyDataChanged(['tag']);
    })
    .catch(error => {
      console.log(error);
    });

  const newTags = tags.value.filter(val => val.id != tid);
  tags.value = newTags;
}

</script>

<template>
  <div class="flex items-center gap-1 py-3">
    <span v-for="tag in tags" :key="tag.id" class="badge badge-primary text-nowrap relative tag-box">
      <component :is="TrashIcon" class="shrink-0 h-4 w-4 absolute -right-0.5 -translate-y-2 cursor-pointer trash-icon"
        @click="deleteTag(tag.id)"
      />
      <TagField :tag-value="tag.tag" :tag-id="tag.id" @tag-changed="updateTag"/>
    </span>
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
