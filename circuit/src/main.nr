fn main(position_x: Field, position_y: Field, target_x: pub Field, target_y: pub Field, radius: pub Field) {
    // Check if the point (position_x, position_y) is within the circle defined by
    // center (target_x, target_y) and radius.
    YoungGuRuPikadMai(position_x, position_y, target_x, target_y, radius);
}

fn YoungGuRuPikadMai(
    position_x: Field,
    position_y: Field,
    target_x: Field,
    target_y: Field,
    radius: Field,
) {
    let radius_pow2 = radius * radius;
    let delta_x_pow2 = (position_x - target_x) * (position_x - target_x);
    let delta_y_pow2 = (position_y - target_y) * (position_y - target_y);
    let distance_pow2 = delta_x_pow2 + delta_y_pow2;

    // Convert to bits for comparison
    let distance_bits: [u1; 254] = distance_pow2.to_le_bits();
    let radius_bits: [u1; 254] = radius_pow2.to_le_bits();

    // Check if distance_pow2 <= radius_pow2 using bit comparison
    let mut is_inside = true;
    let mut found_difference = false;

    // Compare bits from most significant to least significant
    for i in 0..254 {
        let bit_index = 253 - i;
        if !found_difference {
            if (distance_bits[bit_index] & !radius_bits[bit_index]) == 1 {
                // distance bit is 1 and radius bit is 0, so distance > radius
                is_inside = false;
                found_difference = true;
            } else if (!distance_bits[bit_index] & radius_bits[bit_index]) == 1 {
                // distance bit is 0 and radius bit is 1, so distance < radius
                is_inside = true;
                found_difference = true;
            }
        }
    }

    // Assert that the point is inside the circle
    assert(is_inside);
}

// #[test]
// fn test_main() {
//     // main(1, 2);

//     // Uncomment to make test fail
//     // main(1, 1);
// }
