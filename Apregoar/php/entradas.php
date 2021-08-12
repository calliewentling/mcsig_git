<?php

$db = pg_connect("host=localhost dbname=postgres user=postgres password=thesis2021") or die('could not connect:'.pg_last_error());
// $result = pg_query($db, “SELECT *,ST_AsGeoJSON(geom) FROM Africa”) or die(“Data load failed:”.pg_last_error());
$result = pg_query($db, "SELECT * FROM apregoar_test.entrada_test") or die('Data load failed:'.pg_last_error());
$rows = array(
        //'type' => 'FeatureCollection',
        //'features' => array()
    );
while($r = pg_fetch_assoc($result))
                {
                    $rows[] = $r;
                }
 //echo json_encode($rows);
 $entradasjson = json_encode($rows);
 echo $entradasjson;

 //return $entradasjson; 
?>