<template>
	<div class="container h-screen">
		<div class="py-8">
			<div class="text-sm text-muted tracking-wide uppercase">
				Modules
			</div>
			<div class="flex flex-wrap -mx-3">
				<div
					class="w-1/3"
					v-for="module in modules"
					:key="module.label"
				>
					<DesktopCard class="m-3" :item="module" />
				</div>
			</div>
		</div>
	</div>
</template>
<script>
import DesktopCard from './DesktopCard'

export default {
	name: 'Desktop',
	components: {
		DesktopCard,
	},
	data() {
		return {
			modules: [
				{ label: 'Getting Started', icon: 'play' },
				{ label: 'Accounting', icon: 'book' },
				{ label: 'Buying', icon: 'package' },
				{ label: 'Selling', icon: 'shopping-cart' },
			],
		}
	},
}
</script>
