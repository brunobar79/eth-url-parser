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