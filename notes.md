# Ideas / Notes / Thoughts

We need to support multiple prefixes

`ethereum:${prefix}-${payload}`

Should result in some kind of typescript typed object

## Potential Solutions

```typescript
{
    scope: 'pay' | 'tx' | 'networkadd'
}

```

WHAT IF YOUR ENS NAME STARTS WITH `pay-` or `network-`

2400 is not URI ENCODED, IT SHOULD BE