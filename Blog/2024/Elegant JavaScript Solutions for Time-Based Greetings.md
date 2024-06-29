---
title: "Beyond the Basics: A Dive into Elegant JavaScript Solutions for Time-Based Greetings"
date: 2024-06-24
icon: IbDocument
---
#Blog #JavaScript #Challenges

In the ever-evolving world of software development, sometimes a simple problem can spark a lively discussion among developers. This was exactly the case when a tweet from Flavio Corpa asked the JavaScript community for a more elegant solution to determine greetings based on the time of day.
## The Challenge

[The initial problem](https://x.com/FlavioCorpa/status/1726899445504106668) was straightforward: based on the current hour, a greeting (such as "Good Morning" or "Good Evening") should be displayed. [Flavio](https://x.com/FlavioCorpa) presented a solution using a combination of **Object.fromEntries()** and multiple ranges, which, while functional, felt cumbersome to some.

```js
const hi = () => {
  const greetings = Object.fromEntries([
    ...range(20, 24).map((h) => [h, t('greetGoodNight')]),
    ...range(14, 20).map((h) => [h, t('greetGoodEvening')]),
    ...range(9, 14).map((h) => [h, t('greetGoodMorning')]),
    ...range(5, 9).map((h) => [h, t('greetWakingUp')]),
    ...range(0, 5).map((h) => [h, t('greetGoingToSleep')]),
  ])
  return greetings[new Date().getHours()] // always a number between 0-23
}
```

## Community Solutions

Several developers chimed in with their takes:

[Luna's Array-based Solution](https://x.com/OmgImAlexis/status/1727207912286847362): Suggested simplifying the approach by creating an array pre-filled with greetings for each hour. This solution minimized the code but included conditional checks within an array mapping, which, while cleaner, still didn't hit the mark on elegance for everyone.

```js
const greetings = Array.from({ length: 24 }).map((hour) => {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
});

const greeting = greetings[new Date().getHours()];
```

[Antonio Sarosi's Traditional Approach](https://x.com/antoniosarosi/status/1726964885308010594): Proposed sticking to basic if-else statements. This old-school method is clear and direct but can be verbose, especially with multiple conditions.
TypeScript Enhancements: Another developer suggested using TypeScript to enforce type safety and clarity, adding a layer of sophistication and robustness to the solution.

```js
const hi = () => {
  const hour = new Date().getHours();
  if (hour <= 5) return t("greetGoingToSleep");
  if (hour <= 9) return t("greetWakingUp");
  if (hour <= 14) return t("greetGoodMorning");
  if (hour <= 20) return t("greetEvening");
  return t("greetGoodNight");
}

```

The [vvarhand's solution](https://x.com/vvarhand/status/1727124111800046045) simplifies the problem quite a bit by using a different strategy. I like this solution, although it can be improved.

## My Initial Solution: Simplifying with a Single String

[In response](https://x.com/rafageist/status/1805089706306101737) to the varied proposals, I aimed to distill the essence of the task into something both minimalistic and elegant. Here’s how I approached it:

```js
const hi = () => {
	
	const messages = {
		S: 'greetGoingToSleep',
		W: 'greetWakingUp',
		M: 'greetGoodMorning',
		E: 'greetGoodEvening',
		N: 'greetGoodNight'
	};

	//                 012345678901234567890123
	const greetings = 'SSSSSSWWWWMMMMMEEEEEENNN';
	const now = new Date().getHours();
	
	return t(messages[greetings[now]]);
}

```

This solution involves creating a string where each character represents a specific greeting associated with a range of hours. The elegance here lies in the direct indexing provided by the string—no need for complex conditionals or extensive mappings. This makes the function extremely fast and easy to manage, as changing the greeting for a particular hour range is as simple as adjusting a single character in the string.

Of course, this can be more compact, but perhaps it is not necessary to exaggerate so much:

```js
const hi = () => t({
	S: 'greetGoingToSleep',
	W: 'greetWakingUp',
	M: 'greetGoodMorning',
	E: 'greetGoodEvening',
	N: 'greetGoodNight'
}[('SSSSSSWWWWMMMMMEEEEEENNN')[new Date().getHours()]]);
```

## Extending to a Multicultural Approach

While the initial solution worked beautifully for a singular cultural context, the real world often demands more flexibility. Thus, I extended the idea to cater to different cultural norms, which is crucial in a globally connected digital environment.

```js
const hi = (culture = 'default') => {
    const configurations = {
        default: {
            messages: {
                S: 'greetGoingToSleep',
                W: 'greetWakingUp',
                M: 'greetGoodMorning',
                E: 'greetGoodEvening',
                N: 'greetGoodNight'
            },
            greetings: 'SSSSSSWWWWMMMMMEEEEEENNN'
        },
        spain: {
            messages: {
                S: 'saludoNocturno',
                W: 'saludoDespertar',
                M: 'buenosDias',
                E: 'buenasTardes',
                N: 'buenasNoches'
            },
            greetings: 'SSSSSSWWWWWMMMMEEEENNNNN'
        },
        japan: {
            messages: {
                S: 'oyasuminasai',
                W: 'ohayouGozaimasu',
                M: 'konnichiwa',
                E: 'konbanwa',
                N: 'oyasumi'
            },
            greetings: 'SSSSSSWWWWMMMMMEEEENNNNN'
        },
        /* ... */
    };

    const config = configurations[culture] || configurations['default'];
	const messages = config.messages;
	const greetings = config.greetings;
    const now = new Date().getHours();
    
    return t(messages[greetings[now]]);
};

```

In this extended version, the function not only adapts to the hour but also to cultural variations in greeting times and phrases. This adaptability allows the function to be more universally applicable, addressing the nuances of international usage.

My journey through this challenge illustrates the power of simple yet smart coding practices that are scalable and adaptable. By starting with a minimalist approach and then expanding to accommodate multicultural needs, the solution demonstrates how software development can and should adapt to a broad spectrum of user requirements.

This solution leverages a configuration object that maps each hour to a specific greeting based on the cultural context. It reduces the need for multiple condition checks and makes it incredibly easy to adapt the function for different cultural norms by simply changing or adding to the configuration object.

## Conclusion

The thread highlighted the diversity of thought within the programming community. From traditionalists who favor clarity and simplicity to innovators seeking to reduce redundancy and improve maintainability, each solution offers unique insights.

As developers, our job is not just to write code, but to craft solutions that are efficient, understandable, and maintainable. This discussion was a beautiful reminder of how community input can lead to better solutions and how sometimes, stepping beyond the first intuitive approach can yield surprisingly elegant results.