let _observer = null;

export function observeTarget(targetId, onLoadMore) {
  const target = document.getElementById(targetId);
  if (!target) return;
  resetObserver();
  _observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) onLoadMore?.();
  }, { rootMargin: '200px' });
  _observer.observe(target);
}

export async function loadNextPage(fetchFn, state) {
  if (state.loading || !state.hasMore) return state;
  state.loading = true;
  showSkeleton(state.skeletonId, true);
  try {
    const { items, hasMore } = await fetchFn(state.page);
    state.items.push(...items);
    state.page++;
    state.hasMore = hasMore;
  } finally {
    state.loading = false;
    showSkeleton(state.skeletonId, false);
  }
  return state;
}

export function showSkeleton(containerId, show) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (show) {
    el.innerHTML = Array(3).fill(`<div class="skeleton-card">
      <div class="skeleton skeleton-img"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text short"></div>
    </div>`).join('');
    el.classList.remove('hidden');
  } else {
    el.classList.add('hidden');
  }
}

export function resetObserver() {
  _observer?.disconnect();
  _observer = null;
}

export function createPagerState(pageSize = 12) {
  return { page: 0, pageSize, items: [], hasMore: true, loading: false, skeletonId: 'scrollSkeleton' };
}
