---
date: 2024-07-26
icon: IbDocument
---

#Blog #Article #NET #MAUI

In a recent project using .NET MAUI, we faced a significant challenge with the `ListView` on Android. The issue was that items would become invisible when an item was removed from an `ObservableCollection`. This blog post documents the problem, the analysis, and the solution we implemented.

## The Problem

When removing an item from an `ObservableCollection` bound to a `ListView`, we observed that some items would disappear, leaving gaps. The problem was reported in the .NET MAUI GitHub repository ([Issue #16137](https://github.com/dotnet/maui/issues/16137)), and the provided code for removing items looked like this:

```csharp
public void RemoveArtikel(Artikel artikel) 
{
    var art = voorraadkasten.FirstOrDefault(k => k.KastId == artikel.KastId);

    if (art != null)
    {
        art.Artikelen.Remove(artikel);

        if (art.Artikelen.Count == 0)
        {
            voorraadkasten.Remove(art);
        }
    }
}

```

## Initial Workaround

To address the issue, I modified the method to recreate the `ObservableCollection` after removing an item, forcing the `ListView` to update correctly:

```csharp
public void RemoveArtikel(Artikel artikel) 
{
    var art = voorraadkasten.FirstOrDefault(k => k.KastId == artikel.KastId);

    if (art != null)
    {
        art.Artikelen.Remove(artikel);
        art.Artikelen = new ObservableCollection<Artikel>(art.Artikelen);

        if (art.Artikelen.Count == 0)
        {
            voorraadkasten.Remove(art);
        }
    }

    gescandItems.ItemsSource = art.Artikelen;
}

```
## Performance Considerations

Initially, there were concerns that recreating the collection could affect performance, especially with large lists. However, tests showed that the performance was actually better when the `ItemsSource` was set on the main thread using `Dispatcher.Dispatch`:

```csharp
public void RemoveArtikel(Artikel artikel) 
{
    Debug.WriteLine("Removing artikel");
    
    var art = voorraadkasten.FirstOrDefault(k => k.KastId == artikel.KastId);

    if (art != null)
    {
        art.Artikelen.Remove(artikel);
        art.Artikelen = new ObservableCollection<Artikel>(art.Artikelen);

        if (art.Artikelen.Count == 0)
        {
            voorraadkasten.Remove(art);
        }
    }

    Dispatcher.Dispatch(() => {
        gescandItems.ItemsSource = art.Artikelen;
    });

    Debug.WriteLine("Artikel removed");
}

```

## Thread-Safety

Ensuring thread safety is crucial, especially when dealing with UI updates. To handle concurrent access safely, we used `BindingBase.EnableCollectionSynchronization`:

```csharp
private readonly object _lock = new object();

// ...

voorraadkasten = new ObservableCollection<VoorraadKast>();

BindingBase.EnableCollectionSynchronization(voorraadkasten, _lock, ObservableCollectionCallback);

// ...

private void ObservableCollectionCallback(IEnumerable collection, object context, Action accessMethod, bool writeAccess)
{
    lock (context)
    {
        accessMethod();
    }
}

```

## Conclusion

Through testing and adjustments, we confirmed that updating the `ItemsSource` on the main thread not only resolved the visibility issue but also improved performance significantly. This experience underscores the importance of thread safety and performance considerations in UI development.