// A $( document ).ready() block.
$( document ).ready(function() {
    $( "#send_classifications" ).click(function() {
      classifications = []
	  $( "select" ).each(function( index ) {
	  	classification = [this.id.split("-")[1], $( this ).val()]
	  	classifications.push(classification);
	  });
	  console.log(classifications);

	  $.ajax({
		  type: "POST",
		  url: "/classifier/",
		  data: {
		  	classifications: classifications
		  },
		  success: function(msg){
		        alert( "Suas classificações foram salvas!" );
		        window.location.href = "/login";
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		     alert("Houve algum erro com a sua classificação. Entre em contato com a Diretoria e tente novamente em alguns instantes");
		  }
		});
	});

	$( "#button_draw" ).click(function() {
		$.ajax({
		  type: "POST",
		  url: "/draw_teams/",
		  success: function(msg){
	         window.location.href = "/draw_teams";
		  },
		  error: function(XMLHttpRequest, textStatus, errorThrown) {
		     alert("Erro no sorteio!");
		  }
		});
	});
});