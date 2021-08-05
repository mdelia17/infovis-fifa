var dataset; // global

d3.json("data/test.json")
	.then(function(data) {
        dataset = data;
        main(data);
    });

function main(data) {
    console.log(dataset[1])
}